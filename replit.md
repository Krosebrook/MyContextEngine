# AI-Powered File Organization & Knowledge Management Platform

## Overview

This project is an AI-powered knowledge management system designed for organizing diverse file types (PDFs, images, documents, code, zips) into structured, searchable knowledge bases. It leverages multi-provider AI (Gemini, Claude, OpenAI GPT-4o-mini) to analyze, categorize, tag, and summarize content, enabling intelligent file organization. The system features a robust job processing pipeline with background workers for text extraction and AI-driven metadata generation. All data resides in a multi-tenant PostgreSQL database, offering real-time UI updates and local drive scanning capabilities.

**User Experience Philosophy**: The system is designed to feel magical and instant, transforming a complex 20-step technical process into a simple 3-step experience: (1) Drop a file, (2) Wait ~10 seconds with animated progress, (3) Find it in Knowledge Base with smart tags. All complexity is hidden behind professional animations, auto-refresh mechanisms, and intelligent defaults.

**Performance & Accessibility**: FlashFusion implements WCAG 2.2 AA compliance with enhanced focus indicators, skip links, reduced-motion support, and semantic HTML. Core Web Vitals are monitored automatically (LCP, INP, CLS, FCP, TTFB) with performance budgets enforced. Code splitting via React.lazy() reduces initial bundle size, font preloading prevents FOIT, and the LazyImage component (IntersectionObserver-based) defers offscreen images.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React and TypeScript, utilizing Vite for development and bundling. It employs `wouter` for client-side routing and `shadcn/ui` (built on Radix UI primitives) for components, styled with Tailwind CSS. The design adheres to Carbon Design System principles from IBM, emphasizing information hierarchy, clarity, and density for enterprise data applications, featuring IBM Plex Sans typography. Styling uses a custom color system with HSL variables for theming, supporting light/dark modes. State management is handled by TanStack Query for server state.

**Animation & Polish**: All animations respect `prefers-reduced-motion` for accessibility. Framer Motion powers stagger effects (50ms delay between KB grid entries), hover elevations, smooth page transitions, and loading skeletons. No spinners used—loading states use skeleton screens for professional polish.

**Auto-Refresh Architecture**: Upload success triggers automatic query invalidation for KB, files, and statistics queries. Users never need to manually refresh—the UI updates seamlessly within ~10 seconds of upload completion. Success toasts guide users to the Knowledge Base without requiring navigation.

Key pages include:
- **Landing**: Public-facing page for logged-out users with "Get Started" button triggering Replit Auth OAuth flow.
- **Dashboard**: Overview of metrics and recent jobs (not yet implemented).
- **Files**: Drag-and-drop upload interface with animated 3-stage progress indicators (Upload → Extract → Analyze), real-time status cards, and auto-refresh on completion.
- **Knowledge Base**: Grid view of AI-analyzed content with stagger animations, sparkle icons, search filters, sorting, and download options. Uses loading skeletons instead of spinners.
- **System Monitor** (formerly Jobs): Analytics-first dashboard with real-time metrics (success rate, throughput, bottlenecks), AI provider performance tracking, failure pattern analysis, and gap identification. Auto-refreshes every 5 seconds.
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

**Authentication & Authorization**: Fully integrated with Replit Auth using OpenID Connect. User sessions are managed via PostgreSQL-backed session store with automatic table creation. Multi-tenant isolation is enforced through application-layer filtering where `tenantId` equals the authenticated user's ID (extracted from JWT claims `req.user.claims.sub`). All API endpoints are protected with `isAuthenticated` middleware. Session cookies are environment-aware (secure in production, HTTP-compatible in development) with 7-day expiration and automatic token refresh.

## External Dependencies

### Third-Party Services

-   **Replit Platform Services**: Neon PostgreSQL, Supabase Storage, Replit Auth (integrated), Replit Workflows, Replit deployment infrastructure.
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
-   **Authentication**: Passport.js, `openid-client`, `express-session`, `connect-pg-simple`
-   **Database**: Drizzle ORM, `@neondatabase/serverless`, `ws`
-   **File Upload**: Multer
-   **Storage**: `@supabase/supabase-js`
-   **Validation**: Zod
-   **Build Tools**: esbuild, `tsx`

---

## Documentation Framework

This project uses a **hybrid PEPO + Replit documentation approach** that balances structured decision-making with lightweight overhead, optimized for small teams and active development.

### 📚 Documentation Index

#### Architecture Decision Records (ADRs)
**Location**: [`docs/architecture-decisions.md`](./docs/architecture-decisions.md)

Documents major architectural choices with rationale, consequences, and metrics:
- **ADR-001**: Dual Database Architecture (Neon + Supabase)
- **ADR-002**: Multi-Provider AI Strategy (Gemini, Claude, OpenAI)
- **ADR-003**: Scanner Security Model (Whitelist validation)
- **ADR-004**: Job Processing Pipeline (Dispatcher + Processor)
- **ADR-005**: Multi-Tenant Architecture (Application-layer isolation)
- **ADR-006**: Authentication & Authorization Strategy (Deferred implementation)

#### Quality & Metrics
**Location**: [`docs/quality-metrics-baseline.md`](./docs/quality-metrics-baseline.md)

Tracks system-wide and feature-level quality scores, performance benchmarks, and cost efficiency:
- Overall system quality: **Q = 0.87** (estimated, pending automated testing)
- Feature breakdowns (Upload: 0.92, AI Analysis: 0.88, Scanner: 0.89, Search: 0.82)
- Performance metrics, reliability targets, security posture
- **Note**: Current scores are manual estimates until instrumentation is added

#### Templates for Consistency
**Location**: `docs/templates/`

Reusable formats for consistent documentation:
- **RCA Template**: Root cause analysis for incidents
- **Gap Analysis Template**: Production readiness assessments
- **Quality Scoring**: Metrics calculation framework

#### Scaling & Evolution Guide
**Location**: [`docs/scaling-evolution-guide.md`](./docs/scaling-evolution-guide.md) ⭐

**Critical for future growth** - Maps current lightweight approach to enterprise-grade LLM-SARP v2.7:
- **When to upgrade**: Trigger conditions (team size, compliance needs, incidents)
- **Migration paths**: Incremental vs. big bang approaches
- **Feature-by-feature adoption**: Schema registry, OTel, auto-healing, FinOps, compliance
- **Cost-benefit analysis**: ROI calculations for each v2.7 feature
- **Decision tree**: Should you upgrade? (spoiler: not yet, but guide is ready)

#### Reference Specifications
**Location**: `docs/references/`

- **LLM-SARP v2.7 Spec**: Full specification for enterprise-grade documentation framework

### 🎯 Current Approach vs. Future State

| Aspect | Current (Hybrid) | Future (LLM-SARP v2.7) | When to Upgrade |
|--------|------------------|------------------------|-----------------|
| **Format** | Markdown ADRs | JSON Schema-validated | Team ≥5 people |
| **Quality Tracking** | Manual estimates | Automated telemetry | Production launch |
| **Validation** | None | CI gates + pre-commit | Documentation drift |
| **Compliance** | Not required | NIST/OWASP mapping | Enterprise sales |
| **Auto-Healing** | Manual response | Triggered rollbacks | Incidents >2/month |

**Philosophy**: Start lightweight, scale intentionally. The [`scaling-evolution-guide.md`](./docs/scaling-evolution-guide.md) provides the upgrade path when you need it.

### 📅 Governance & Maintenance

**Review Cadence**:
- **Monthly**: Update quality metrics baseline with new measurements
- **Quarterly**: Review ADRs, update statuses, deprecate outdated decisions
- **After major features**: Create new ADRs for significant architectural changes
- **After incidents**: Generate RCA documents using template

**Next Scheduled Reviews**:
- Quality metrics: 2024-11-25 (monthly)
- ADR review: 2025-01-26 (quarterly)
- Scaling assessment: When team ≥5 people OR compliance required

**Keeping Documentation Current**:
1. After adding automated tests → Update quality scores with real data
2. After major releases → Refresh gap analysis for production readiness
3. When assumptions change → Revisit relevant ADRs
4. Before fundraising/audits → Consider adopting relevant v2.7 features (see scaling guide)