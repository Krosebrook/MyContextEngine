# Design Guidelines: Orchestration & AI Experimentation Platform

## Design Approach

**Selected System**: Carbon Design System (IBM)
**Rationale**: Carbon is purpose-built for data-heavy enterprise applications with complex workflows, making it ideal for this orchestration platform. It excels at presenting dense information clearly while maintaining professional aesthetics suited to technical users.

## Core Design Principles

1. **Information Hierarchy First**: Prioritize data visibility and quick scanning over decorative elements
2. **Functional Clarity**: Every component serves a clear purpose in the workflow
3. **Density Management**: Balance information density with breathing room for complex dashboards
4. **Status-Driven Design**: Visual states (running, queued, failed, succeeded) guide user attention

## Typography System

**Font Stack**: 
- Primary: IBM Plex Sans (via Google Fonts CDN)
- Monospace: IBM Plex Mono (for code, IDs, timestamps)

**Hierarchy**:
- Page Titles: text-3xl font-medium
- Section Headers: text-xl font-medium  
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Metadata: text-sm font-normal
- Timestamps/IDs: text-xs font-mono

## Layout System

**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4 or gap-6
- Container margins: mx-8, my-6

**Grid Structure**:
- Main container: max-w-7xl mx-auto
- Dashboard layouts: 12-column grid with 16-unit gutters
- Sidebar navigation: Fixed 16-unit width on desktop, collapsible on mobile

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed height (h-16)
- Contains: Logo, tenant selector dropdown, primary navigation links, user profile menu
- Sticky positioning for constant access

**Sidebar Navigation** (for dashboard pages):
- Collapsible drawer on mobile
- Persistent on desktop (w-64)
- Nested navigation for Projects → Experiments → Runs hierarchy
- Active state indicator with subtle accent treatment

### Dashboard Components

**Data Tables**:
- Striped rows for improved scannability
- Fixed header on scroll
- Sortable columns with directional indicators
- Row actions in overflow menu (kebab icon)
- Pagination controls at bottom
- Density toggle (compact/comfortable/spacious)

**Status Indicators**:
- Pill-shaped badges with icon + text for job states
- Icon-only indicators for dense tables
- Consistent iconography: Running (spinner), Succeeded (checkmark), Failed (alert), Queued (clock)

**Metric Cards**:
- Grid layout: 3-4 cards per row on desktop, stack on mobile
- Structure: Large number, label, trend indicator, sparkline chart
- Minimum height: h-32
- Use for: Total jobs, success rate, avg latency, token usage

**Job/Run Detail Panels**:
- Two-column layout: Metadata sidebar (w-80) + main content area
- Metadata includes: Status, timestamps, attempt count, tenant info
- Main area: Logs viewer (virtualized list), progress bars, shard breakdown

### Forms & Composers

**Job Composer**:
- Multi-step wizard for complex configurations
- Progress indicator showing current step
- Sections: Basic info, scheduling, batch parameters, advanced options
- JSON editor with syntax highlighting for payload field

**Evaluation Suite Composer**:
- Tabs for: Configuration, Metrics, Guardrails, Providers
- Provider selection grid (3 columns): Gemini, Claude, ChatGPT cards with model dropdowns
- Safety settings as segmented controls
- Budget inputs with real-time cost estimation display

**Prompt Version Editor**:
- Split view: Editor pane (w-1/2) + preview/test pane (w-1/2)
- Monaco editor integration for prompt body
- Variable tag insertion helper
- Version comparison view (diff display)

### Charts & Visualizations

**Job Progress**:
- Horizontal stacked bar showing shard status distribution
- Timeline view for job history (Gantt-style)

**Evaluation Metrics**:
- Line charts for trends (latency, pass rate over time)
- Bar charts for provider comparisons
- Cost breakdown pie chart

**System Health**:
- Real-time throughput chart (area chart)
- Queue depth bar chart
- Error rate trend line

## Page Layouts

### Jobs Dashboard
- Header: Page title + "Create Job" button
- Metrics row: 4 metric cards
- Filters bar: Status filter, date range, search
- Data table: Jobs list with inline status, actions
- Bottom: Pagination

### Job Detail
- Breadcrumb navigation
- Header: Job ID (monospace) + status badge + action buttons (Cancel, Retry)
- Two-column: Sidebar (metadata) + main (tabs for Shards, Logs, Events)
- Progress visualization at top of main area

### Experiments Dashboard
- Project selector dropdown
- Suite cards in grid (3 columns)
- Each card: Suite name, mode badge, primary metric, "View Runs" link
- "Create Suite" card with plus icon

### Evaluation Run Detail
- Header: Run ID + prompt version + status
- Provider chips showing model selections
- Metrics grid (4 columns): Latency, Token usage, Pass rate, Cost
- Samples table with expandable rows for full input/output
- Charts section below

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px - Stack all columns, collapsible sidebar, simplified tables
- Tablet: 768px-1024px - 2-column grids, persistent navigation
- Desktop: > 1024px - Full multi-column layouts, fixed sidebar

**Mobile Optimizations**:
- Bottom sheet for filters instead of sidebar
- Swipe actions on table rows
- Condensed metric cards (2 per row)
- Tabs for switching between dashboard sections

## Accessibility

- All interactive elements: min-height h-11 (44px touch target)
- Form labels: Always visible, properly associated
- Status indicators: Icon + text (never color alone)
- Keyboard navigation: Full support with visible focus states
- Skip links for main content areas
- ARIA labels for icon-only buttons

## Images

**Usage**: Minimal - this is a utility application focused on data
**Where to include**:
- Empty states: Illustrations for "No jobs yet", "No experiments", "No devices"
- Onboarding: Simple diagrams explaining orchestration concepts
- Error states: Friendly illustrations for 404, 500, connection errors

**Style**: Simple, flat illustrations in single accent tone, geometric shapes preferred over detailed artwork. Keep file sizes small (<50KB).

## Key Interactions

- **Real-time Updates**: Polling every 5 seconds for job status, visible loading state
- **Bulk Actions**: Checkbox selection in tables with action bar appearing at top
- **Inline Editing**: Click-to-edit for job names, suite configurations
- **Drag-to-reorder**: For prompt version priority, experiment ordering
- **Expandable Rows**: For nested shard details, log entries
- **Toast Notifications**: For async actions (job created, evaluation started)

## Performance Considerations

- Virtualized lists for logs (1000+ entries)
- Pagination for all tables (50 rows default)
- Skeleton screens during data loading
- Debounced search inputs (300ms)
- Lazy load charts only when visible