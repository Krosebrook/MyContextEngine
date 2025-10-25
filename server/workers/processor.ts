import { storage } from "../storage";
import { extractText } from "./text-extractor";
import { analyzeWithAI } from "./ai-analyzer";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { jobRuns } from "@shared/schema";
import { syncJobToSupabase, syncFileToSupabase, syncKbEntryToSupabase, uploadFileToSupabaseStorage } from "../supabase-sync";

async function processTextExtraction(tenantId: string, jobId: string, fileId: string) {
  try {
    const file = await storage.getFile(tenantId, fileId);
    if (!file) {
      throw new Error("File not found");
    }

    const text = await extractText(file.uploadPath, file.mimeType);
    await storage.updateFileStatus(tenantId, fileId, "extracted", text);

    // Sync updated file to Supabase
    const updatedFile = await storage.getFile(tenantId, fileId);
    if (updatedFile) {
      await syncFileToSupabase(updatedFile);
    }

    const analysisJob = await storage.createJob({
      tenantId,
      kind: "ai_analyze",
      status: "queued",
      priority: 100,
      metadata: { fileId },
    });

    // Sync new job to Supabase for real-time updates
    await syncJobToSupabase(analysisJob);

    console.log(`[Worker] Created analysis job ${analysisJob.id} for file ${fileId}`);
    return { success: true, nextJobId: analysisJob.id };
  } catch (error: any) {
    console.error("[Worker] Text extraction error:", error);
    throw error;
  }
}

async function processAIAnalysis(tenantId: string, jobId: string, fileId: string) {
  try {
    const file = await storage.getFile(tenantId, fileId);
    if (!file) {
      throw new Error("File not found");
    }

    if (!file.extractedText) {
      throw new Error("No extracted text available");
    }

    const analysis = await analyzeWithAI(
      file.extractedText,
      file.originalName,
      "gemini"
    );

    const kbEntry = await storage.createKbEntry({
      tenantId,
      fileId: file.id,
      title: analysis.title,
      summary: analysis.summary,
      category: analysis.category,
      tags: analysis.tags,
      metadata: { originalFilename: file.originalName, mimeType: file.mimeType },
    });

    await storage.updateFileStatus(tenantId, fileId, "analyzed");

    // Sync KB entry to Supabase
    await syncKbEntryToSupabase(kbEntry);

    // Upload file to Supabase Storage
    const storagePath = await uploadFileToSupabaseStorage(
      file.id,
      file.uploadPath,
      file.originalName
    );

    // Update file with storage path in Supabase
    const finalFile = await storage.getFile(tenantId, fileId);
    if (finalFile) {
      await syncFileToSupabase(finalFile);
    }

    console.log(`[Worker] Created KB entry ${kbEntry.id} for file ${fileId}`);
    return { success: true, kbEntryId: kbEntry.id };
  } catch (error: any) {
    console.error("[Worker] AI analysis error:", error);
    throw error;
  }
}

export async function processJobRuns() {
  try {
    const runs = await db
      .select()
      .from(jobRuns)
      .where(eq(jobRuns.status, "queued"))
      .limit(5);

    for (const run of runs) {
      try {
        await storage.updateJobRunStatus(run.tenantId, run.id, "running");

        const job = await storage.getJob(run.tenantId, run.jobId);
        if (!job || !job.metadata) {
          throw new Error("Invalid job or metadata");
        }

        const fileId = (job.metadata as any).fileId;
        let result;

        if (job.kind === "text_extract") {
          result = await processTextExtraction(run.tenantId, job.id, fileId);
        } else if (job.kind === "ai_analyze") {
          result = await processAIAnalysis(run.tenantId, job.id, fileId);
        } else {
          throw new Error(`Unknown job kind: ${job.kind}`);
        }

        await storage.updateJobRunStatus(run.tenantId, run.id, "succeeded", result);
        await storage.updateJobStatus(run.tenantId, job.id, "succeeded");

        // Sync updated job status to Supabase
        const updatedJob = await storage.getJob(run.tenantId, job.id);
        if (updatedJob) {
          await syncJobToSupabase(updatedJob);
        }

        console.log(`[Worker] Completed job run ${run.id}`);
      } catch (error: any) {
        console.error(`[Worker] Job run ${run.id} failed:`, error);
        await storage.updateJobRunStatus(run.tenantId, run.id, "failed", null, error.message);
        await storage.updateJobStatus(run.tenantId, run.jobId, "failed", error.message);

        // Sync failed job status to Supabase
        const failedJob = await storage.getJob(run.tenantId, run.jobId);
        if (failedJob) {
          await syncJobToSupabase(failedJob);
        }
      }
    }
  } catch (error) {
    console.error("[Worker] Process job runs error:", error);
  }
}

export function startWorker(intervalMs: number = 5000) {
  console.log(`[Worker] Starting with interval ${intervalMs}ms`);
  setInterval(processJobRuns, intervalMs);
  processJobRuns(); // Run immediately
}
