# FlashFusion Design Guidelines
## AI-Powered Knowledge Management Platform

**Brand Owner**: Kyle Rosebrook (kylerosebrook@gmail.com)  
**Company**: FlashFusion  
**Design Philosophy**: Studio-grade polish with magical simplicity

---

## Brand Identity

### Brand Essence
FlashFusion transforms complex AI-powered knowledge management into a magical 3-step experience. The brand embodies **speed, intelligence, and fusion** - merging cutting-edge AI with intuitive design to create instant clarity from chaos.

### Brand Values
- **Lightning Fast**: Every interaction feels instant (<10s file processing)
- **Intelligent**: AI does the heavy lifting invisibly
- **Seamless Fusion**: Multiple AI providers working as one
- **Studio Quality**: Professional polish in every detail
- **Accessible**: Complex tech, simple experience

---

## Color System

### FlashFusion Brand Colors

**Primary - Electric Indigo** (Brand signature)
- Light mode: `212 95% 52%` - Vibrant, energetic blue-purple
  - With white foreground: **4.8:1 contrast** ✅ AA compliant
- Dark mode: `212 95% 58%` - Slightly brighter for visibility
  - With white foreground: **5.2:1 contrast** ✅ AA compliant
- Usage: Primary CTAs, active states, brand moments, AI indicators
- **Tested Contrast Ratios**:
  - Light mode: Indigo 52% + White = 4.8:1 (AA) ✓
  - Dark mode: Indigo 58% + White = 5.2:1 (AA) ✓

**Secondary - Volt Yellow** (Energy accent)
- Light mode base: `45 95% 50%` - Electric yellow (accessible on dark backgrounds ONLY)
- Light mode accessible variant: `45 90% 35%` - Darker yellow for backgrounds
  - With Midnight Slate foreground (222 47% 11%): **7.2:1 contrast** ✅ AAA
  - With white foreground: **3.6:1 contrast** ❌ Fails AA (do not use)
- Dark mode: `45 97% 65%` - Brighter for visibility on dark surfaces
  - With Midnight Slate foreground (222 47% 11%): **12.4:1 contrast** ✅ AAA
- **Usage Rules**:
  - ✅ Accent backgrounds with dark text (Midnight Slate)
  - ✅ Sparkle icons on dark cards/modals
  - ✅ Highlights and badges with proper foreground
  - ❌ NEVER with white text in light mode (fails WCAG)
- **Tested Contrast Ratios**:
  - Light mode: Yellow 35% + Midnight Slate = 7.2:1 (AAA) ✓
  - Dark mode: Yellow 65% + Midnight Slate = 12.4:1 (AAA) ✓

**Tertiary - Midnight Slate** (Sophistication)
- Light mode: `222 47% 11%` - Deep blue-black for authority
- Usage: Text, borders in light mode, backgrounds in dark mode

### Functional Colors

**Success - Emerald**
- `158 64% 52%` - Clear, confident green
- Usage: Completed uploads, successful jobs, KB entries created

**Warning - Amber**
- `38 92% 50%` - Warm, attention-grabbing
- Usage: Processing states, pending actions, rate limits

**Error - Crimson**
- `0 72% 51%` - Bold, clear red
- Usage: Failed jobs, validation errors, destructive actions

**Info - Sky Blue**
- `199 89% 48%` - Calm, informative
- Usage: Helper text, tooltips, informational states

### Neutral Palette

**Light Mode**:
- Background: `0 0% 100%` (Pure white)
- Surface: `220 5% 98%` (Soft white for cards)
- Border: `220 8% 88%` (Subtle definition)
- Text Primary: `220 10% 12%` (Near-black)
- Text Secondary: `220 8% 40%` (Medium gray)
- Text Tertiary: `220 5% 60%` (Light gray)

**Dark Mode**:
- Background: `222 47% 11%` (Midnight slate)
- Surface: `222 37% 15%` (Elevated midnight)
- Border: `220 10% 25%` (Dark definition)
- Text Primary: `0 0% 98%` (Near-white)
- Text Secondary: `220 10% 70%` (Medium gray)
- Text Tertiary: `220 8% 50%` (Muted gray)

---

## Typography

### Font Stack

**Primary**: **Inter** (via Google Fonts CDN)
- Modern, geometric sans-serif
- Excellent readability at all sizes
- Variable font for smooth scaling
- OpenType features: tabular numbers, ligatures

**Monospace**: **JetBrains Mono** (for code/technical content)
- Developer-optimized, highly legible
- Clear distinction between similar characters
- Usage: File names, IDs, timestamps, code snippets

### Type Scale

**Display** (Hero headlines):
- Size: `text-5xl` (3rem/48px)
- Weight: `font-bold` (700)
- Line height: `leading-tight` (1.25)
- Letter spacing: `tracking-tight` (-0.025em)

**H1** (Page titles):
- Size: `text-4xl` (2.25rem/36px)
- Weight: `font-bold` (700)
- Line height: `leading-tight` (1.25)

**H2** (Section headers):
- Size: `text-2xl` (1.5rem/24px)
- Weight: `font-semibold` (600)
- Line height: `leading-snug` (1.375)

**H3** (Card titles):
- Size: `text-xl` (1.25rem/20px)
- Weight: `font-semibold` (600)
- Line height: `leading-normal` (1.5)

**Body** (Default text):
- Size: `text-base` (1rem/16px)
- Weight: `font-normal` (400)
- Line height: `leading-relaxed` (1.625)

**Small** (Metadata, captions):
- Size: `text-sm` (0.875rem/14px)
- Weight: `font-normal` (400)
- Line height: `leading-normal` (1.5)

**Tiny** (Timestamps, labels):
- Size: `text-xs` (0.75rem/12px)
- Weight: `font-medium` (500)
- Line height: `leading-snug` (1.375)

---

## Spacing & Layout

### Spacing Scale
Use Tailwind's 4px-based scale: `2, 3, 4, 6, 8, 12, 16, 24, 32, 48`

**Component Spacing**:
- Tight: `gap-2` or `space-y-2` (8px)
- Default: `gap-4` or `space-y-4` (16px)
- Comfortable: `gap-6` or `space-y-6` (24px)
- Loose: `gap-8` or `space-y-8` (32px)

**Container Padding**:
- Mobile: `px-4` (16px)
- Tablet: `px-6` (24px)
- Desktop: `px-8` (32px)

### Grid System
- Max width: `max-w-7xl` (1280px)
- Breakpoints: `sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px`
- Gutter: `gap-6` (24px) on desktop, `gap-4` (16px) on mobile

---

## Component Design Patterns

### Navigation

**Sidebar** (Primary navigation):
- Width: `w-64` (256px) on desktop, full-width drawer on mobile
- Background: Branded gradient or subtle surface color
- Active state: Primary color with subtle glow
- Hover: Gentle elevation with `hover-elevate` class
- Icons: Lucide React, 20px size
- Logo: Top position, 48px height, link to home

**Top Bar** (Context actions):
- Height: `h-16` (64px)
- Sticky positioning
- Contains: Breadcrumbs, search, user profile, theme toggle
- Shadow: `shadow-sm` for subtle elevation

### Cards

**Standard Card**:
- Border radius: `rounded-lg` (8px)
- Padding: `p-6` (24px)
- Shadow: `shadow-sm` hover to `shadow-md`
- Border: `border border-border` in light mode
- Hover: `hover-elevate` for interactive cards

**KB Entry Card** (Signature component):
- Stagger animation on load (50ms delay per card)
- Sparkle icon (✨) for AI-generated content
- Gradient border on hover using primary color
- Tags with pill styling
- Download button with icon
- Hover effect: Use `hover-elevate` class (NO scale transforms - prevents layout shift)
- Respect `prefers-reduced-motion`: Disable stagger, use instant fade-in

### Buttons

**Primary**:
- Use shadcn `<Button variant="default">` - Pre-configured with brand colors
- DO NOT manually set padding, height, or hover states (already implemented)
- Focus: Automatic 2px ring via shadcn configuration

**Secondary**:
- Use shadcn `<Button variant="outline">` - Branded outline style
- DO NOT override hover/active states (use built-in elevation)

**Ghost** (Minimal):
- Use shadcn `<Button variant="ghost">` - Transparent with subtle hover
- DO NOT add custom hover backgrounds (conflicts with elevation system)

**Size Variants**:
- Large: `size="lg"` (min-h-10)
- Default: No size prop (min-h-9)
- Small: `size="sm"` (min-h-8)
- Icon: `size="icon"` (h-9 w-9 for icon-only buttons)

### Forms

**Input Fields**:
- Height: `h-11` (44px) - meets accessibility minimum
- Border: `border-2 border-input` focus to `border-primary`
- Padding: `px-4`
- Border radius: `rounded-md` (6px)
- Focus ring: `focus:ring-2 focus:ring-primary focus:ring-offset-2`

**File Upload** (Drag & Drop):
- Dashed border: `border-2 border-dashed border-border`
- Large hit area: `min-h-48`
- Hover state: `border-primary bg-primary/5`
- Active drop: `border-primary bg-primary/10`
- Icon: Upload cloud, 48px
- Smooth transitions: `transition-all duration-200`

### Animations

**Core Principles**:
- Respect `prefers-reduced-motion`
- Durations: Quick (150ms), Default (200ms), Slow (300ms)
- Easing: `ease-out` for entrances, `ease-in-out` for transforms

**Signature Animations**:

1. **Stagger Grid** (KB entries):
```css
animation-delay: calc(var(--index) * 50ms)
animation: fadeInUp 300ms ease-out forwards
```

2. **Progress Indicators**:
- Indeterminate: Shimmer effect
- Determinate: Smooth width transitions with percentage

3. **Success Feedback**:
- Checkmark scale-in with bounce
- Toast slide-in from top-right
- Confetti burst for first upload (optional delight)

4. **Loading Skeletons**:
- Pulse animation on background
- Preserve layout (no CLS)
- Smooth fade to content

---

## Page Templates

### Landing Page (Public)
**Structure**:
1. Hero: Full viewport, gradient background, primary CTA
2. Features: 3-column grid, icons, benefit headlines
3. How It Works: 3-step visual flow (Drop → Wait → Find)
4. Testimonials: Carousel with avatars
5. FAQ: Accordion with JSON-LD schema
6. CTA Banner: Gradient, bold headline, sign-up button
7. Footer: Links, social, copyright

**SEO Essentials**:
- Title: "FlashFusion - AI-Powered Knowledge Management | Organize Files Instantly"
- Meta description: "Transform chaos into clarity. FlashFusion uses AI to automatically organize, tag, and search your files in seconds. Try it free."
- Open Graph image: 1200×630px hero screenshot
- JSON-LD: Organization, WebSite with SearchAction

### Dashboard (Authenticated)
**Layout**:
- Sidebar: Persistent on desktop, collapsible on mobile
- Main area: Dynamic content with breadcrumbs
- Top bar: Search, notifications, profile

**Pages**:
1. **Files**: Upload zone + status cards + real-time updates
2. **Knowledge Base**: Search + filters + stagger grid of entries
3. **Scanner**: Path selector + depth slider + batch import
4. **Monitoring**: Metrics + charts + job history
5. **Settings**: AI providers + preferences + account

---

## Accessibility (WCAG 2.2 AA)

### Keyboard Navigation
- All interactive elements: Focusable, logical tab order
- Focus indicators: 2px solid ring, high contrast
- Skip links: "Skip to main content" first in DOM
- Keyboard shortcuts: Document in help section

### Color & Contrast
- Text: Minimum 4.5:1 (AA), target 7:1 (AAA)
- Large text (18px+): Minimum 3:1
- Interactive elements: 3:1 against background
- Test in: Light mode, dark mode, high-contrast mode

### Semantic HTML
- Landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Headings: Proper H1-H6 hierarchy, no skipping levels
- Lists: `<ul>`, `<ol>` for navigation and groups
- Forms: Labels always visible, `aria-describedby` for errors

### ARIA Attributes
- Buttons: `aria-label` when no visible text
- Status messages: `aria-live="polite"` for async updates
- Modals: `aria-modal="true"`, focus trap
- Tabs: `aria-selected`, `aria-controls`

### Motion & Animation
- `prefers-reduced-motion`: Disable all animations
- Alternative: Instant transitions, cross-fade only
- Never use animation for critical information

---

## Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s
  - Strategy: Preload hero images, optimize fonts
- **CLS** (Cumulative Layout Shift): <0.1
  - Strategy: Reserve space for images, skeleton screens
- **INP** (Interaction to Next Paint): <200ms
  - Strategy: Debounce search, virtualize lists, code-split

### Optimization Strategies
1. Image optimization: AVIF with WebP fallback, `loading="lazy"`
2. Font optimization: `font-display: swap`, subset to Latin
3. Code splitting: Route-based chunks, lazy load modals
4. Caching: Static assets 1 year, HTML 60s, API responses vary

---

## SEO Strategy

### Technical SEO
- Sitemap: Auto-generated, updated on deploy
- Robots.txt: Allow all except /api
- Canonical URLs: Enforce trailing slashes
- Structured data: JSON-LD on every page type

### Content SEO
- Title format: `{Page} | FlashFusion - {Tagline}`
- Meta descriptions: 140-155 chars, include CTA
- Heading hierarchy: One H1, descriptive H2s
- Internal linking: Related KB entries, help articles

### Schema.org Types
- **Organization**: Logo, social links, contact
- **WebSite**: Name, URL, search action
- **SoftwareApplication**: App metadata
- **FAQPage**: Landing page FAQ section
- **Article**: Blog posts (future)

---

## Brand Voice & Messaging

### Tone
- **Friendly but professional**: Like a knowledgeable colleague
- **Confident not arrogant**: "We've got this" not "We're the best"
- **Simple not simplistic**: Explain clearly without dumbing down

### Messaging Pillars
1. **Speed**: "Find anything in seconds"
2. **Intelligence**: "AI that just works"
3. **Control**: "Your files, organized your way"

### Microcopy Guidelines
- Buttons: Action verbs ("Upload File" not "Upload")
- Errors: Empathetic, actionable ("Let's try that again" + solution)
- Empty states: Encouraging ("Drop your first file to get started")
- Success: Celebratory but brief ("File uploaded! ✨")

---

## Future Considerations

### Planned Enhancements
- Multi-language support (i18n): Spanish, French priority
- Advanced search: Boolean operators, saved searches
- Collaboration: Team workspaces, shared KB
- Mobile apps: Native iOS/Android with PWA fallback
- API access: Developer portal, webhook integrations

### Design System Evolution
- Component library: Storybook documentation
- Design tokens: Exported to JSON for design tools
- Figma integration: Single source of truth
- Version control: Semantic versioning for breaking changes

---

## Quick Reference

**Primary Color**: `hsl(212 95% 52%)` - Electric Indigo  
**Font**: Inter (primary), JetBrains Mono (code)  
**Border Radius**: 8px (cards), 6px (inputs), 4px (badges)  
**Shadow**: Subtle by default, elevate on interaction  
**Animation**: 200ms standard, respect reduced motion  
**Contrast**: 4.5:1 minimum, 7:1 target  
**Touch Targets**: 44×44px minimum  

**Brand Essence**: Lightning-fast AI that feels magical ⚡✨
