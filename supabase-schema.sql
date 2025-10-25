-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE files;
ALTER PUBLICATION supabase_realtime ADD TABLE kb_entries;

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  tenant_id VARCHAR NOT NULL,
  kind VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  result JSONB,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON jobs(scheduled_at);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  tenant_id VARCHAR NOT NULL,
  filename VARCHAR NOT NULL,
  original_name VARCHAR NOT NULL,
  mime_type VARCHAR NOT NULL,
  size INTEGER NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'uploaded',
  extracted_text TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_tenant ON files(tenant_id);

-- KB Entries table
CREATE TABLE IF NOT EXISTS kb_entries (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  tenant_id VARCHAR NOT NULL,
  file_id VARCHAR NOT NULL REFERENCES files(id),
  title VARCHAR NOT NULL,
  summary TEXT NOT NULL,
  category VARCHAR NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_entries_tenant ON kb_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_entries_category ON kb_entries(category);

-- Storage bucket for organized files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organized-files', 'organized-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow authenticated users to upload
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'organized-files');

-- Storage policy: Allow authenticated users to read
CREATE POLICY "Allow reads" ON storage.objects
FOR SELECT USING (bucket_id = 'organized-files');
