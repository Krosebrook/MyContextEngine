import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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
