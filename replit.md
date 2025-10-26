# AI-Powered File Organization & Knowledge Management Platform

## Overview

This project is an AI-powered knowledge management system designed for organizing diverse file types (PDFs, images, documents, code, zips) into structured, searchable knowledge bases. It leverages multi-provider AI (Gemini, Claude, OpenAI GPT-4o-mini) to analyze, categorize, tag, and summarize content, enabling intelligent file organization. The system features a robust job processing pipeline with background workers for text extraction and AI-driven metadata generation. All data resides in a multi-tenant PostgreSQL database, offering real-time UI updates and local drive scanning capabilities. The business vision is to provide a seamless, intelligent platform for personal and potentially collaborative knowledge management, addressing the growing need for efficient information retrieval and organization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React and TypeScript, utilizing Vite for development and bundling. It employs `wouter` for client-side routing and `shadcn/ui` (built on Radix UI primitives) for components, styled with Tailwind CSS. The design adheres to Carbon Design System principles from IBM, emphasizing information hierarchy, clarity, and density for enterprise data applications, featuring IBM Plex Sans typography. Styling uses a custom color system with HSL variables for theming, supporting light/dark modes. State management is handled by TanStack Query for server state.

Key pages include:
- **Dashboard**: Overview of metrics and recent jobs.
- **Files**: Drag-and-drop upload interface with real-time progress.
- **Knowledge Base**: Grid view of AI-analyzed content with search, filters, sorting, and download options.
- **Jobs**: Listing of job statuses with actions and auto-refresh.
- **Scanner**: Local drive scanning with security features and batch import.

### Technical Implementations

The backend uses Express.js with TypeScript and ESM modules. It integrates with Vite for HMR in development and serves static files in production. Drizzle ORM is used with Neon Serverless driver for PostgreSQL, supporting pooled WebSocket connections.

**API Design**: RESTful endpoints under `/api/*` for files, jobs, knowledge base entries, statistics, and scanner operations.

**Worker Architecture**:
- **Dispatcher**: Periodically dequeues jobs and creates job runs for tenants.
- **Processor**: Executes job runs for text extraction and AI analysis.
- **Text Extractor**: Extracts text from uploaded files.
- **AI Analyzer**: Utilizes selected AI providers (Gemini, Claude, OpenAI) to generate structured metadata.

**Job Processing Flow**: Files are uploaded, triggering a job for text extraction. Upon completion, an AI analysis job is initiated to generate metadata, which is then stored in the knowledge base and reflected in the UI.

**Multi-tenancy**: Achieved via application-layer `tenantId` filtering on all database queries.

### System Design Choices

**Dual Database Architecture**: Neon for jobs/orchestration, Supabase for file storage and real-time features. This leverages best-in-class solutions for specific use cases.

**Multi-Provider AI Strategy**: Supports Gemini, Claude, and OpenAI with an abstraction layer for cost optimization, resilience, and quality routing.

**Scanner Security Model**: Employs a whitelist-based path validation with cryptographic boundary checks to prevent path traversal attacks, allowing secure local drive scanning.

**Job Processing Pipeline**: Designed with a dual-worker (Dispatcher + Processor) polling architecture for tenant isolation, fault tolerance, and observable execution.

**Data Storage**:
- **Primary Database**: Neon PostgreSQL for all structured data (users, files, jobs, job_runs, kb_entries).
- **Secondary Storage**: Supabase Storage for file uploads, utilizing signed URLs for secure access.
- **Schema Design**: UUID primary keys, `tenantId` for multi-tenancy, status enums, and timestamps across tables. JSONB columns are used for flexible metadata.

**Authentication & Authorization**: Currently uses a "default-tenant" but is designed for future integration with Replit Auth for user authentication and tenant identification via JWT claims, with application-layer row-level security.

## External Dependencies

### Third-Party Services

-   **Replit Platform Services**: Neon PostgreSQL, Supabase Storage, Replit Auth (planned), Replit Workflows, Replit deployment infrastructure.
-   **AI Model Providers**:
    -   **Google Gemini**: Models `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash` via `@google/genai`.
    -   **Anthropic Claude**: Models `claude-3-7-sonnet`, `claude-3-7-haiku`, `claude-3-opus` via `@anthropic-ai/sdk`.
    -   **OpenAI**: Models `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo` via `openai`.

### API Keys and Configuration

Secrets are managed via Replit Secrets Manager: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### Frontend Libraries

-   **UI Framework**: React 18, TypeScript
-   **Component Library**: Radix UI primitives, `shadcn/ui`
-   **Styling**: Tailwind CSS, PostCSS
-   **Icons**: Lucide React, `react-icons`
-   **Forms**: React Hook Form, Zod validation (`@hookform/resolvers`)
-   **State Management**: TanStack Query v5
-   **Routing**: `wouter`

### Backend Libraries

-   **Server**: Express.js
-   **Database**: Drizzle ORM, `@neondatabase/serverless`, `ws`
-   **File Upload**: Multer
-   **Storage**: `@supabase/supabase-js`
-   **Validation**: Zod
-   **Build Tools**: esbuild, `tsx`