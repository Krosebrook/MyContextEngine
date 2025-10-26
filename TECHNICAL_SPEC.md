# Technical Specification

**Project:** AI-Powered Knowledge Management System  
**Last Updated:** October 26, 2025  
**Stack:** TypeScript, React, Express, PostgreSQL (Neon), Supabase Storage  

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Worker Processes](#worker-processes)
7. [Frontend Structure](#frontend-structure)
8. [Environment Configuration](#environment-configuration)
9. [Deployment](#deployment)
10. [Development Workflow](#development-workflow)

---

## System Overview

This is an AI-powered file organization and knowledge management platform that:

- **Scans and imports** files from local drives or via upload
- **Processes files** using a background job system (text extraction → AI analysis)
- **Organizes content** with multi-provider AI (Gemini, Claude, OpenAI GPT-4o-mini)
- **Provides real-time updates** via Supabase realtime subscriptions
- **Enables intelligent search** across tagged, categorized, and summarized content

**Business Value:** Automatically transforms unstructured files into a searchable knowledge base with AI-generated metadata, summaries, and categorization.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                          │
│  (Vite + TanStack Query + Supabase Realtime + Wouter)          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP + WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Backend                           │
│                  (REST API + Multer Upload)                     │
└────────┬────────────────────────────────────────────────────────┘
         │
         ├─────► Neon PostgreSQL (Job Queue + Metadata)
         │
         ├─────► Supabase Storage (File Blobs)
         │
         └─────► Worker Processes
                 ├─ Dispatcher (dequeues jobs → creates job runs)
                 └─ Processor (executes job runs)
                    ├─ Text Extractor
                    └─ AI Analyzer (Gemini/Claude/OpenAI)
```

### Key Architectural Decisions

1. **Dual Database Strategy** (ADR-001)
   - **Neon PostgreSQL**: Job orchestration, metadata, knowledge base entries
   - **Supabase Storage**: File blobs with signed URLs
   - **Rationale**: Leverage best-in-class solutions for specific use cases

2. **Multi-Provider AI** (ADR-002)
   - Support for Gemini, Claude, and OpenAI with abstraction layer
   - Default: Gemini 2.0 Flash (cost-optimized)
   - **Rationale**: Resilience, cost optimization, quality routing

3. **Job Processing Pipeline** (ADR-004)
   - Dual-worker polling architecture (Dispatcher + Processor)
   - **Dispatcher**: Dequeues jobs, creates job runs (10s interval)
   - **Processor**: Executes job runs (5s interval)
   - **Rationale**: Tenant isolation, fault tolerance, observable execution

4. **Multi-Tenant Design** (ADR-005)
   - Application-layer `tenantId` filtering on all queries
   - Current: Single "default-tenant" for MVP
   - **Future**: Replit Auth integration with JWT-based tenant identification

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: wouter 3.x
- **State Management**: TanStack Query v5 (server state)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.x + PostCSS
- **Icons**: lucide-react, react-icons
- **Forms**: react-hook-form + zod validation
- **Design System**: Carbon Design System (IBM) principles

### Backend
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js 4.x
- **ORM**: Drizzle ORM 0.39
- **Database Driver**: @neondatabase/serverless (WebSocket pooling)
- **File Upload**: Multer 2.x
- **Storage SDK**: @supabase/supabase-js
- **Validation**: Zod 3.x
- **Build**: esbuild + tsx (dev)

### AI Providers
- **Google Gemini**: `@google/genai` → models: `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`
- **Anthropic Claude**: `@anthropic-ai/sdk` → models: `claude-3-7-sonnet`, `claude-3-7-haiku`, `claude-3-opus`
- **OpenAI**: `openai` → models: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`

### Infrastructure
- **Database**: Neon PostgreSQL (serverless, pooled WebSocket connections)
- **Storage**: Supabase Storage (file blobs, signed URLs)
- **Auth** (planned): Replit Auth with PostgreSQL RLS
- **Deployment**: Replit Platform (Autoscale, Workflows)

---

## Database Schema

**ORM**: Drizzle ORM  
**Location**: `shared/schema.ts`

### Tables

#### `users`
```typescript
{
  id: varchar (PK, UUID default)
  username: text (unique, not null)
  password: text (not null)
  tenantId: text (not null, default: "default-tenant")
}
```

#### `files`
```typescript
{
  id: varchar (PK, UUID default)
  tenantId: text (not null)
  filename: text (not null)              // Stored filename (UUID-based)
  originalName: text (not null)          // User's original filename
  mimeType: text (not null)
  size: integer (not null)               // Bytes
  uploadPath: text (not null)            // Local path before Supabase upload
  status: text (not null, default: "uploaded")
          // Values: "uploaded", "extracted", "analyzed"
  extractedText: text (nullable)
  uploadedAt: timestamp (not null, default: now())
}
```

#### `jobs`
```typescript
{
  id: varchar (PK, UUID default)
  tenantId: text (not null)
  kind: text (not null)                  // "text_extract" | "ai_analyze"
  status: text (not null, default: "queued")
         // Values: "queued", "running", "succeeded", "failed", "cancelled"
  priority: integer (not null, default: 100)
  scheduledAt: timestamp (not null, default: now())
  startedAt: timestamp (nullable)
  finishedAt: timestamp (nullable)
  attempts: integer (not null, default: 0)
  maxAttempts: integer (not null, default: 3)
  metadata: jsonb (nullable)             // { fileId: string }
  error: text (nullable)
}
```

#### `job_runs`
```typescript
{
  id: varchar (PK, UUID default)
  tenantId: text (not null)
  jobId: varchar (not null)              // FK to jobs.id
  status: text (not null, default: "queued")
         // Values: "queued", "running", "succeeded", "failed"
  startedAt: timestamp (nullable)
  finishedAt: timestamp (nullable)
  error: text (nullable)
  result: jsonb (nullable)
}
```

#### `kb_entries` (Knowledge Base)
```typescript
{
  id: varchar (PK, UUID default)
  tenantId: text (not null)
  fileId: varchar (not null)             // FK to files.id
  title: text (not null)                 // AI-generated
  summary: text (not null)               // AI-generated
  category: text (not null)              // AI-generated
         // Values: "Code", "Documentation", "Data", "Image", 
         //         "Document", "Spreadsheet", "Presentation", 
         //         "Archive", "Other"
  tags: text[] (not null, default: [])   // AI-generated
  metadata: jsonb (nullable)             // { originalFilename, mimeType }
  createdAt: timestamp (not null, default: now())
}
```

### Indexes (Recommended for Production)
```sql
CREATE INDEX idx_files_tenant_status ON files(tenantId, status);
CREATE INDEX idx_jobs_tenant_status ON jobs(tenantId, status);
CREATE INDEX idx_job_runs_tenant_status ON job_runs(tenantId, status);
CREATE INDEX idx_kb_entries_tenant ON kb_entries(tenantId);
CREATE INDEX idx_kb_entries_category ON kb_entries(category);
CREATE INDEX idx_kb_entries_tags ON kb_entries USING GIN(tags);
```

---

## API Endpoints

**Base URL**: `/api`  
**Authentication**: Session-based (future: JWT via Replit Auth)  
**Tenant Isolation**: `getTenantId(req)` extracts from session (default: "default-tenant")

### Files

#### `POST /api/files/upload`
Upload a file and trigger text extraction job.

**Request**: `multipart/form-data`
```
file: <binary>
```

**Response**: `200 OK`
```json
{
  "file": {
    "id": "uuid",
    "tenantId": "default-tenant",
    "filename": "uuid.ext",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "uploadPath": "uploads/uuid.pdf",
    "status": "uploaded",
    "uploadedAt": "2025-10-26T12:00:00Z"
  },
  "job": {
    "id": "uuid",
    "kind": "text_extract",
    "status": "queued",
    "metadata": { "fileId": "uuid" }
  }
}
```

#### `GET /api/files`
List all files for tenant.

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "originalName": "document.pdf",
    "status": "analyzed",
    "uploadedAt": "2025-10-26T12:00:00Z"
  }
]
```

#### `GET /api/files/:id`
Get single file details.

**Response**: `200 OK` or `404 Not Found`

#### `GET /api/files/:id/download`
Get signed URL for file download.

**Response**: `200 OK`
```json
{
  "url": "https://supabase-storage-url/signed-url"
}
```

### Jobs

#### `GET /api/jobs`
List jobs, optionally filtered by status.

**Query Params**:
- `status` (optional): "queued" | "running" | "succeeded" | "failed"

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "kind": "text_extract",
    "status": "succeeded",
    "scheduledAt": "2025-10-26T12:00:00Z",
    "finishedAt": "2025-10-26T12:00:05Z"
  }
]
```

#### `GET /api/jobs/:id`
Get single job details.

#### `POST /api/jobs/:id/retry`
Retry a failed/cancelled job.

**Response**: `200 OK` (updated job)

#### `POST /api/jobs/:id/cancel`
Cancel a queued/running job.

**Response**: `200 OK` (updated job)

### Knowledge Base

#### `GET /api/kb`
List knowledge base entries with optional filters.

**Query Params**:
- `category` (optional): Filter by category
- `search` (optional): Search in title, summary, tags

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "fileId": "uuid",
    "title": "Project Documentation",
    "summary": "Comprehensive guide to the project architecture...",
    "category": "Documentation",
    "tags": ["architecture", "guide", "technical"],
    "createdAt": "2025-10-26T12:00:00Z",
    "metadata": {
      "originalFilename": "README.md",
      "mimeType": "text/markdown"
    }
  }
]
```

### Statistics

#### `GET /api/stats`
Dashboard statistics.

**Response**: `200 OK`
```json
{
  "totalFiles": 150,
  "totalJobs": 300,
  "totalKbEntries": 145,
  "jobsByStatus": {
    "queued": 5,
    "running": 2,
    "succeeded": 280,
    "failed": 13
  }
}
```

### Scanner (Local Drive)

#### `POST /api/scanner/scan`
Scan a local directory for files.

**Request**: `application/json`
```json
{
  "path": "/Users/username/Documents"
}
```

**Response**: `200 OK`
```json
{
  "files": [
    {
      "path": "/Users/username/Documents/file.pdf",
      "name": "file.pdf",
      "size": 1024000,
      "mimeType": "application/pdf"
    }
  ]
}
```

**Security**: Whitelist-based path validation with cryptographic boundary checks (ADR-003)

#### `POST /api/scanner/import`
Import scanned files into the system.

**Request**: `application/json`
```json
{
  "files": [
    {
      "path": "/Users/username/Documents/file.pdf",
      "name": "file.pdf",
      "size": 1024000,
      "mimeType": "application/pdf"
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "imported": 45,
  "rejected": 2,
  "importedFiles": [...],
  "rejectedFiles": [
    { "path": "...", "reason": "File too large (>100MB)" }
  ]
}
```

---

## Worker Processes

**Location**: `server/workers/`

### Architecture

```
┌──────────────┐      ┌──────────────┐
│  Dispatcher  │      │  Processor   │
│  (10s poll)  │      │  (5s poll)   │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │ 1. Dequeue job      │ 2. Dequeue job_run
       │ 2. Create job_run   │ 3. Execute work
       │                     │ 4. Update status
       ▼                     ▼
┌─────────────────────────────────────┐
│      Neon PostgreSQL (jobs)         │
└─────────────────────────────────────┘
```

### 1. Dispatcher (`dispatcher.ts`)

**Purpose**: Dequeue jobs and create job runs for processing.

**Interval**: 10 seconds (configurable)

**Logic**:
```typescript
async function dispatch() {
  for each tenant:
    job = dequeueJob(tenantId)  // Atomic: status = running, attempts++
    if (job):
      createJobRun({ jobId: job.id, status: "queued" })
}
```

**Started by**: `server/index.ts` → `startDispatcher(10000)`

### 2. Processor (`processor.ts`)

**Purpose**: Execute job runs (text extraction → AI analysis).

**Interval**: 5 seconds (configurable)

**Logic**:
```typescript
async function processJobRuns() {
  for each tenant:
    jobRuns = dequeueJobRuns(tenantId, limit: 5)
    
    for each jobRun:
      job = getJob(jobRun.jobId)
      
      if (job.kind === "text_extract"):
        result = processTextExtraction(fileId)
        // Creates new job: kind="ai_analyze"
      
      else if (job.kind === "ai_analyze"):
        result = processAIAnalysis(fileId)
        // Creates KB entry, updates file status="analyzed"
      
      updateJobRunStatus(success | failed)
      updateJobStatus(success | failed)
}
```

**Started by**: `server/index.ts` → `startWorker(5000)`

### 3. Text Extractor (`text-extractor.ts`)

**Purpose**: Extract text from uploaded files.

**Supported Formats**:
- **Text files**: `.txt`, `.md`, `.json`, `.js`, `.ts`, etc.
- **PDFs**: Placeholder (production: use `pdf-parse`)
- **Documents**: `.docx`, `.doc` (production: use `mammoth`)
- **Images**: Placeholder (production: use OCR/vision APIs)

**Logic**:
```typescript
async function extractText(filePath, mimeType): string {
  if (text/* or json or js):
    return readFile(filePath, "utf-8").slice(0, 50000)
  
  if (pdf):
    return "[PDF placeholder - use pdf-parse]"
  
  // ... other formats
}
```

### 4. AI Analyzer (`ai-analyzer.ts`)

**Purpose**: Generate structured metadata using AI.

**Prompt Structure**:
```
Analyze the following file content and provide a structured analysis.

Filename: {originalFilename}
Content: {text.slice(0, 10000)}

Response format (JSON):
{
  "title": "Clear, descriptive title",
  "summary": "2-3 sentence summary",
  "category": "Code | Documentation | Data | ...",
  "tags": ["tag1", "tag2", "tag3"]
}
```

**Provider Selection**:
- **Default**: Gemini 2.0 Flash (`gemini-2.0-flash-exp`)
- **Configurable**: Claude 3.7 Sonnet, OpenAI GPT-4o-mini

**Fallback Logic**:
```typescript
if (AI call fails):
  return {
    title: originalFilename,
    summary: text.slice(0, 200),
    category: inferCategoryFromExtension(filename),
    tags: []
  }
```

---

## Frontend Structure

**Location**: `client/src/`

### Pages (`pages/`)

| Page | Route | Purpose |
|------|-------|---------|
| `Dashboard.tsx` | `/` | Overview metrics, recent activity |
| `Files.tsx` | `/files` | Drag-and-drop upload, file list |
| `KnowledgeBase.tsx` | `/kb` | AI-analyzed content grid with search/filter |
| `Jobs.tsx` | `/jobs` | Job status table with retry/cancel actions |
| `JobsRealtime.tsx` | `/jobs-realtime` | Live job updates via Supabase |
| `Scanner.tsx` | `/scanner` | Local drive scanning interface |
| `Providers.tsx` | `/providers` | AI provider configuration |
| `Prompts.tsx` | `/prompts` | Prompt engineering playground |
| `Monitoring.tsx` | `/monitoring` | System health (future) |
| `Experiments.tsx` | `/experiments` | Feature testing |

### Key Components

**App.tsx**:
- SidebarProvider with Carbon Design System navigation
- TanStack Query client setup
- Wouter routing
- Theme provider (light/dark mode)

**Sidebar**:
- Persistent navigation with IBM Plex Sans typography
- Active route highlighting
- Collapsible on mobile

**Real-time Integration** (`lib/supabase.ts`):
```typescript
supabase
  .channel('jobs')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'jobs' 
  }, callback)
  .subscribe()
```

### State Management

**TanStack Query Patterns**:
```typescript
// Fetch with type safety
const { data: files } = useQuery<File[]>({ 
  queryKey: ['/api/files'] 
});

// Mutation with cache invalidation
const uploadMutation = useMutation({
  mutationFn: (formData) => apiRequest('/api/files/upload', {
    method: 'POST',
    body: formData
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/files'] });
  }
});
```

### Styling

**Design System**: Carbon Design System (IBM)
- **Typography**: IBM Plex Sans
- **Spacing**: Consistent 4px grid
- **Colors**: HSL variables in `index.css`
- **Density**: Information-dense for enterprise data apps

**Tailwind Configuration**:
- Custom color system with semantic tokens
- Dark mode support via `class` strategy
- Utility classes: `hover-elevate`, `active-elevate-2`

---

## Environment Configuration

### Required Secrets

**Backend**:
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
OPENAI_API_KEY=sk-...
SESSION_SECRET=random-secret-string
```

**Frontend** (`.env` file):
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Setup

**Storage Bucket**: `files`
- Public: No
- Allowed MIME types: All
- Max file size: 100MB

**Realtime**: Enable for `jobs`, `files`, `kb_entries` tables

**RLS Policies** (future):
```sql
-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY tenant_isolation ON files
  FOR ALL USING (tenant_id = current_setting('app.tenant_id'));
```

---

## Deployment

### Replit Platform

**Workflow**: `npm run dev`
- Starts Express server on port 5000
- Vite dev server with HMR
- Workers (Dispatcher + Processor) auto-start

**Build**: `npm run build`
- `vite build` → static frontend to `dist/public`
- `esbuild` → backend to `dist/index.js`

**Production**: `npm start`
- Serves static frontend + API from single process
- Workers run alongside Express server

### Database Migrations

**Tool**: Drizzle Kit

```bash
# Push schema changes (development)
npm run db:push

# Generate migrations (production)
npx drizzle-kit generate

# Apply migrations (production)
npx drizzle-kit migrate
```

### Scaling Considerations

**Current**: Single-process with in-memory workers  
**Next**: 
1. Separate worker processes (Replit Workflows)
2. Job queue with Redis/BullMQ
3. Horizontal autoscaling for API servers
4. Database connection pooling (already using Neon's pooler)

---

## Development Workflow

### Local Setup

```bash
# Install dependencies
npm install

# Setup environment variables
# Add DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, AI keys

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

### Key Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server (Express + Vite + Workers) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Sync database schema |

### File Upload Flow (End-to-End)

```
1. User uploads file → POST /api/files/upload
2. Multer saves to uploads/ directory
3. Create file record (status: "uploaded")
4. Sync file to Supabase realtime
5. Create job (kind: "text_extract", status: "queued")
6. Sync job to Supabase realtime

--- Background Workers ---

7. Dispatcher dequeues job → creates job_run
8. Processor picks up job_run
9. Text Extractor reads file → extracts text
10. Update file (status: "extracted", extractedText: "...")
11. Create new job (kind: "ai_analyze")
12. Processor picks up AI analysis job
13. AI Analyzer calls Gemini/Claude/OpenAI
14. Parse JSON response → structured metadata
15. Create KB entry (title, summary, category, tags)
16. Update file (status: "analyzed")
17. Upload file to Supabase Storage
18. Sync all changes to Supabase realtime

--- Frontend ---

19. Real-time subscription updates UI
20. User sees analyzed content in Knowledge Base
```

### Testing Strategy (Planned)

**Unit Tests**: Vitest for utilities, AI parsers  
**Integration Tests**: Supertest for API endpoints  
**E2E Tests**: Playwright via `run_test` tool  
**Quality Target**: Q = 0.90 (see `docs/quality-metrics-baseline.md`)

### Documentation

- **Architecture Decisions**: `docs/architecture-decisions.md`
- **Quality Metrics**: `docs/quality-metrics-baseline.md`
- **Scaling Guide**: `docs/scaling-evolution-guide.md`
- **Project Overview**: `replit.md`

---

## Performance Metrics

**Current Estimates** (MVP, not instrumented):

| Metric | Target | Current |
|--------|--------|---------|
| File upload | <2s | ~1s (local) |
| Text extraction | <5s | ~2s (text files) |
| AI analysis | <10s | ~3-8s (varies by provider) |
| Search query | <500ms | ~200ms |
| Real-time latency | <1s | ~500ms |

**Bottlenecks**:
1. AI API calls (3-8s per file)
2. PDF/document parsing (not yet implemented)
3. Large file uploads (100MB limit)

**Optimization Opportunities**:
1. Batch AI analysis requests
2. Cache frequently accessed files
3. Implement CDN for file downloads
4. Add database indexes (see schema section)

---

## Security Considerations

1. **Path Traversal Protection** (Scanner)
   - Whitelist-based validation
   - Cryptographic boundary checks
   - No symlink following

2. **File Upload Limits**
   - 100MB max file size
   - MIME type validation
   - Filename sanitization (UUID-based)

3. **Multi-Tenancy** (ADR-005)
   - Application-layer `tenantId` filtering
   - Future: PostgreSQL RLS + JWT auth

4. **Secret Management**
   - Replit Secrets Manager
   - Never expose API keys in frontend
   - Environment-based configuration

5. **Supabase Security**
   - Anon key (public, rate-limited)
   - Signed URLs for file downloads
   - RLS policies (future)

---

## Known Limitations & Roadmap

### Current Limitations

1. **Authentication**: No user login (single "default-tenant")
2. **Text Extraction**: Limited format support (PDFs are placeholders)
3. **Scalability**: Single-process workers (not horizontally scalable)
4. **Real-time**: Supabase dependency (vendor lock-in risk)
5. **Testing**: No automated tests yet (manual QA only)

### Roadmap

**Phase 1 (MVP - Current)**:
- ✅ File upload + storage
- ✅ Job processing pipeline
- ✅ Multi-provider AI integration
- ✅ Knowledge base with search
- ✅ Local drive scanner

**Phase 2 (Production-Ready)**:
- [ ] Replit Auth integration
- [ ] PostgreSQL RLS policies
- [ ] Automated testing (E2E + integration)
- [ ] Performance instrumentation (OpenTelemetry)
- [ ] Production-grade PDF/document parsing

**Phase 3 (Scale)**:
- [ ] Separate worker processes (Replit Workflows)
- [ ] Redis-based job queue
- [ ] Horizontal autoscaling
- [ ] Advanced search (vector embeddings)
- [ ] Collaborative features (shared knowledge bases)

---

## Troubleshooting

### Common Issues

**Problem**: Jobs stuck in "queued" status  
**Solution**: Check worker logs, ensure `startDispatcher()` and `startWorker()` are called

**Problem**: "Missing Supabase environment variables"  
**Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`

**Problem**: File upload fails with 413 (Payload Too Large)  
**Solution**: File exceeds 100MB limit, adjust `multer.limits.fileSize`

**Problem**: AI analysis returns fallback data  
**Solution**: Check AI provider API keys, verify API quota/rate limits

**Problem**: Real-time updates not working  
**Solution**: Enable Supabase Realtime for tables, check WebSocket connection

### Debug Logs

```typescript
// Enable verbose logging
DEBUG=* npm run dev

// Worker-specific logs
[Dispatcher] Dequeued job {jobId} of kind {kind}
[Worker] Processing job run {jobRunId}
[Worker] Text extraction completed for file {fileId}
[Worker] AI analysis completed for file {fileId}
```

---

## Contact & Contributions

**Maintainer**: [Your Team]  
**Repository**: [GitHub URL]  
**Documentation**: See `docs/` folder for detailed architecture decisions  

For questions or issues, consult:
1. `replit.md` - Project overview
2. `docs/architecture-decisions.md` - Design rationale
3. `docs/scaling-evolution-guide.md` - Growth strategy
4. This document - Technical implementation details
