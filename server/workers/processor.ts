import { storage } from "../storage";
import { extractText } from "./text-extractor";
import { analyzeWithAI } from "./ai-analyzer";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { jobRuns } from "@shared/schema";

async function processTextExtraction(tenantId: string, jobId: string, fileId: string) {
  try {
    const file = await storage.getFile(tenantId, fileId);
    if (!file) {
      throw new Error("File not found");
    }

    const text = await extractText(file.uploadPath, file.mimeType);
    await storage.updateFileStatus(tenantId, fileId, "extracted", text);

    const analysisJob = await storage.createJob({
      tenantId,
      kind: "ai_analyze",
      status: "queued",
      priority: 100,
      metadata: { fileId },
    });

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

        console.log(`[Worker] Completed job run ${run.id}`);
      } catch (error: any) {
        console.error(`[Worker] Job run ${run.id} failed:`, error);
        await storage.updateJobRunStatus(run.tenantId, run.id, "failed", null, error.message);
        await storage.updateJobStatus(run.tenantId, run.jobId, "failed", error.message);
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
