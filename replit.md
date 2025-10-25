# AI-Powered File Organization & Knowledge Management Platform

## Recent Updates

### Latest Session Features (Completed & Architect-Reviewed)
1. **File Download System** - Download buttons on KB entries with Supabase Storage signed URLs (60s expiry)
2. **Bulk File Upload** - Drag-drop multiple files with real-time queue tracking UI showing success/error status per file
3. **OpenAI Integration** - Added GPT-4o-mini provider alongside Gemini and Claude for AI analysis
4. **Advanced KB Search** - Full-text search across title/summary/tags, multi-category filtering, sorting (date/title/category)
5. **Local Drive Scanner** - New `/scanner` page to scan C:/D: drives with:
   - Secure path whitelist (C:\, D:\, /home, /tmp, homedir, uploads/)
   - Path boundary validation using path.resolve() + path.relative()
   - Depth limit (3), file count (500), size filter (<100MB)
   - Batch import (50 files max) with rejection tracking
   - Platform-aware root paths (Windows/POSIX)

## Overview

This is an AI-powered knowledge management system where users can drag-and-drop any files (PDFs, images, documents, code, zips) and have them automatically organized into structured, searchable knowledge bases. The system uses multi-provider AI (Gemini, Claude, OpenAI GPT-4o-mini) to analyze, categorize, tag, and summarize content, creating an intelligent file organization platform.

The application features a complete job processing pipeline with background workers that extract text from files and leverage AI to generate structured metadata (title, summary, category, tags) for each file. All data is stored in a multi-tenant PostgreSQL database with real-time UI updates and local drive scanning capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing

**UI Components**: shadcn/ui component library built on Radix UI primitives, styled with Tailwind CSS following the Carbon Design System principles

**Design System**: Carbon Design System (IBM) aesthetic with IBM Plex Sans typography for enterprise data applications. The design emphasizes information hierarchy, functional clarity, and density management for complex dashboards.

**State Management**: TanStack Query (React Query) for server state management with infinite stale time and disabled refetching by default

**Styling Approach**: Tailwind CSS with custom color system using HSL variables for theming. Supports light/dark modes with theme toggle functionality. Custom spacing scale (2, 4, 6, 8, 12, 16, 24 units) and specific border radius values (.1875rem, .375rem, .5625rem).

**Key Pages**:
- Dashboard: Overview with metrics (total files, KB entries, jobs, success rate) and recent jobs table
- Files: Drag-and-drop file upload interface with real-time upload progress, file status tracking, and bulk upload queue
- Knowledge Base: Grid view of AI-analyzed content with full-text search, category filters, sorting options, download buttons, and AI-generated metadata
- Jobs: Job listing with status filters, search, and actions (retry, cancel) with 5-second auto-refresh
- Scanner: Local drive scanner (C:/D:) with path whitelist security, batch import, and rejection tracking
- Monitoring: System events and job progress tracking (placeholder for future implementation)

**Component Architecture**:
- Reusable status badges with animations for job states (queued, running, succeeded, failed, canceled)
- Metric cards with trend indicators
- Job progress bars with shard-level granularity
- Provider selection interface supporting multiple AI models
- Prompt editor with variable interpolation

### Backend Architecture

**Framework**: Express.js server with TypeScript

**Module System**: ESM (ES Modules) throughout

**Development Server**: Vite middleware integration for HMR in development; static file serving in production

**Database ORM**: Drizzle ORM with Neon Serverless driver for PostgreSQL, configured with WebSocket support via the `ws` package

**Database Connection**: Pooled connections using `@neondatabase/serverless` Pool with WebSocket constructor for compatibility

**API Design**: RESTful endpoints under `/api/*` namespace:
- `/api/files/*` - File upload, retrieval, and download (with signed URLs)
- `/api/jobs/*` - Job management (list, retry, cancel)
- `/api/kb/*` - Knowledge base entries with search/filter/sort
- `/api/stats` - Dashboard statistics
- `/api/scanner/*` - Local drive scanning and batch import with security whitelisting

**Worker Architecture**: Separate worker modules for asynchronous processing:
- **Dispatcher** (`server/workers/dispatcher.ts`): Runs on interval (10s default) to dequeue jobs and create job runs for each tenant
- **Processor** (`server/workers/processor.ts`): Executes job runs for text extraction and AI analysis
- **Text Extractor** (`server/workers/text-extractor.ts`): Extracts text from uploaded files (currently simplified, production would use pdf-parse, mammoth, etc.)
- **AI Analyzer** (`server/workers/ai-analyzer.ts`): Uses Gemini, Claude, or OpenAI (GPT-4o-mini) to analyze extracted text and generate structured metadata (title, summary, category, tags)

**Job Processing Flow** (Fully Implemented):
1. File uploaded via drag-and-drop or file selector → Stored to `uploads/` directory → Job created with `kind: "text_extract"` and `status: "queued"`
2. Dispatcher (runs every 10s) finds queued jobs → Creates job runs
3. Processor (runs every 5s) picks up text extraction job → Extracts text → Updates file record → Creates AI analysis job
4. Processor picks up AI analysis job → Calls Gemini or Claude AI provider → Generates title, summary, category, and tags → Stores results in knowledge base
5. UI refreshes automatically showing updated job statuses and new KB entries

**Multi-tenancy**: Application-layer tenant isolation using `tenantId` from session (defaults to "default-tenant" when session not configured). All database queries filter by `tenantId`.

**Error Handling**: Jobs track attempts and max attempts (default 3) for retry logic. Errors stored in job records for debugging.

### Data Storage Solutions

**Primary Database**: Neon PostgreSQL (serverless) provisioned by Replit

**Schema Design** (Drizzle ORM definitions in `shared/schema.ts`):

**Tables**:
- `users`: User accounts with tenant association
- `files`: Uploaded file metadata (filename, mime type, size, upload path, extraction status, extracted text)
- `jobs`: Job queue with kind, status, priority, scheduling timestamps, attempt tracking, and metadata
- `job_runs`: Individual job execution records linked to parent jobs
- `kb_entries`: Knowledge base entries with AI-generated metadata (title, summary, category, tags) linked to files

**Key Fields**:
- All tables use UUID primary keys with `gen_random_uuid()` default
- `tenantId` on all tables for multi-tenant isolation
- `status` fields use text enums (queued, running, succeeded, failed, canceled)
- Timestamps for scheduling, execution tracking (scheduledAt, startedAt, finishedAt, uploadedAt, createdAt)
- JSONB columns for flexible metadata and results storage

**Indexing Strategy**: Application assumes indexes on `tenantId`, `status`, and timestamp fields to prevent full table scans (not explicitly defined in schema file but mentioned in architectural documentation)

**Future Schema**: Documentation references additional tables for full orchestration platform (eval_suites, eval_runs, run_samples, feature_flags, events) and optional ClickHouse integration for high-volume analytics with MergeTree tables.

### Authentication and Authorization

**Current State**: Application uses hardcoded "default-tenant" string for all database queries. Multi-tenant infrastructure is in place but authentication is not yet implemented.

**Future Enhancement**: Replit Auth integration planned for user authentication and tenant identification via JWT claims containing `tenant_id`.

**Authorization Model**: Multi-tenant with application-layer Row-Level Security - all queries filtered by tenant_id extracted from session/auth context.

## External Dependencies

### Third-Party Services

**Replit Platform Services**:
- Neon PostgreSQL database (managed serverless Postgres)
- Replit Auth (planned integration for user authentication)
- Replit Workflows (referenced for scheduled dispatcher execution)
- Replit deployment and autoscaling infrastructure

**AI Model Providers**:
- **Google Gemini** (`@google/genai`): Primary AI provider with models gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash. Supports streaming, safety settings, and fallback logic.
- **Anthropic Claude** (`@anthropic-ai/sdk`): Models claude-3-7-sonnet, claude-3-7-haiku, claude-3-opus. Supports tool calling normalization and token usage tracking.
- **OpenAI** (referenced in UI but SDK not yet integrated): Models gpt-4o, gpt-4o-mini, gpt-4-turbo planned for future integration.

### API Keys and Configuration

Secrets managed via Replit Secrets Manager (environment variables):
- `DATABASE_URL`: Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Anthropic Claude API authentication
- `GEMINI_API_KEY`: Google Gemini API authentication

### Frontend Libraries

**UI Framework**: React 18 with TypeScript
**Component Library**: Radix UI primitives (@radix-ui/*) wrapped in shadcn/ui components
**Styling**: Tailwind CSS with PostCSS
**Icons**: Lucide React icons, react-icons for provider logos
**Forms**: React Hook Form with Zod validation (@hookform/resolvers)
**State Management**: TanStack Query v5 for server state
**Routing**: wouter (lightweight React router)

### Backend Libraries

**Server**: Express.js
**Database**: Drizzle ORM, @neondatabase/serverless, ws (WebSocket for Neon connection)
**File Upload**: Multer for multipart/form-data handling
**Validation**: Zod schemas (via drizzle-zod)
**Build Tools**: esbuild for server bundling, tsx for development execution

### Development Tools

**Build System**: Vite with React plugin
**Type Checking**: TypeScript with strict mode
**Development Plugins**: @replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner
**Database Migrations**: Drizzle Kit with PostgreSQL dialect

### Deployment Configuration

**Production Build**:
- Frontend: Vite build to `dist/public`
- Backend: esbuild bundles server to `dist/index.js` with ESM format and external packages
- Start command: `node dist/index.js` with NODE_ENV=production

**Development**:
- Start command: `tsx server/index.ts` with NODE_ENV=development
- Vite dev server runs in middleware mode with HMR