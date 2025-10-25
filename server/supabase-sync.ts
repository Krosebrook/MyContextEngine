import { supabase } from "./supabase";
import type { Job, File as FileRecord, KbEntry } from "@shared/schema";

const TENANT_ID = "default-tenant";

export async function syncJobToSupabase(job: Job) {
  try {
    const { error } = await supabase
      .from("jobs")
      .upsert({
        id: job.id,
        tenant_id: job.tenantId,
        kind: job.kind,
        status: job.status,
        priority: job.priority,
        metadata: job.metadata || {},
        result: (job as any).result || {},
        error: job.error,
        attempts: job.attempts,
        max_attempts: job.maxAttempts,
        scheduled_at: job.scheduledAt?.toISOString() || new Date().toISOString(),
        started_at: job.startedAt?.toISOString() || null,
        finished_at: job.finishedAt?.toISOString() || null,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error("[Supabase Sync] Job sync error:", error);
    }
  } catch (err) {
    console.error("[Supabase Sync] Job sync failed:", err);
  }
}

export async function syncFileToSupabase(file: FileRecord) {
  try {
    const { error } = await supabase
      .from("files")
      .upsert({
        id: file.id,
        tenant_id: file.tenantId,
        filename: file.filename,
        original_name: file.originalName,
        mime_type: file.mimeType,
        size: file.size,
        status: file.status,
        extracted_text: file.extractedText,
        uploaded_at: file.uploadedAt?.toISOString() || new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error("[Supabase Sync] File sync error:", error);
    }
  } catch (err) {
    console.error("[Supabase Sync] File sync failed:", err);
  }
}

export async function syncKbEntryToSupabase(entry: KbEntry) {
  try {
    const { error } = await supabase
      .from("kb_entries")
      .upsert({
        id: entry.id,
        tenant_id: entry.tenantId,
        file_id: entry.fileId,
        title: entry.title,
        summary: entry.summary,
        category: entry.category,
        tags: entry.tags || [],
        metadata: entry.metadata || {},
        created_at: entry.createdAt?.toISOString() || new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error("[Supabase Sync] KB entry sync error:", error);
    }
  } catch (err) {
    console.error("[Supabase Sync] KB entry sync failed:", err);
  }
}

export async function uploadFileToSupabaseStorage(
  fileId: string,
  filePath: string,
  originalName: string
): Promise<string | null> {
  try {
    const fs = await import("fs");
    const fileBuffer = fs.readFileSync(filePath);
    
    const storagePath = `${TENANT_ID}/${fileId}/${originalName}`;
    
    const { data, error } = await supabase.storage
      .from("organized-files")
      .upload(storagePath, fileBuffer, {
        contentType: "application/octet-stream",
        upsert: true,
      });

    if (error) {
      console.error("[Supabase Storage] Upload error:", error);
      return null;
    }

    return storagePath;
  } catch (err) {
    console.error("[Supabase Storage] Upload failed:", err);
    return null;
  }
}

export async function getFileDownloadUrl(storagePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("organized-files")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error("[Supabase Storage] Download URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[Supabase Storage] Download URL failed:", err);
    return null;
  }
}
