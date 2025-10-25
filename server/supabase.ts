import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export interface SupabaseJob {
  id: string;
  tenant_id: string;
  kind: string;
  status: string;
  priority: number;
  metadata: any;
  result: any;
  error: string | null;
  attempts: number;
  max_attempts: number;
  scheduled_at: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface SupabaseFile {
  id: string;
  tenant_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: string;
  extracted_text: string | null;
  uploaded_at: string;
}

export interface SupabaseKbEntry {
  id: string;
  tenant_id: string;
  file_id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  metadata: any;
  created_at: string;
}
