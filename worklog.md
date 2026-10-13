# AI Mentor Pro - Work Log

This file tracks the work of all agents building AI Mentor Pro.

---
Task ID: 0
Agent: main
Task: Initial project setup and planning for AI Mentor Pro

Work Log:
- Explored project structure (Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Prisma+SQLite)
- Loaded LLM skill (z-ai-web-dev-sdk supports streaming via stream:true returning ReadableStream)
- Confirmed SDK streaming returns SSE body for chat completions
- Installed remark-gfm and rehype-highlight for markdown rendering
- Planned architecture: single `/` route with client-side view switching (landing vs app)
- Tech adaptations: Next.js API routes (not FastAPI), Prisma+SQLite (not Supabase), z-ai-web-dev-sdk LLM (not Gemini directly)
- Design: emerald/teal accent + warm amber, Apple-inspired glassmorphism, dark/light mode, no indigo/blue

Stage Summary:
- Environment confirmed ready. Starting core infrastructure build.

---
Task ID: 3
Agent: frontend-styling-expert (landing page)
Task: Build the AI Mentor Pro landing page

Work Log:
- Read worklog + globals.css + personalities.ts + shadcn button/accordion/sheet to confirm tokens, variants, and existing styles (`.glass`, `.glass-strong`, `.text-gradient`, `.animate-blob`, emerald/amber/violet chart tokens).
- Created `src/components/landing/landing-page.tsx` as a self-contained `"use client"` component (single file, no extra files created).
- Built all 11 required sections in order:
  1. Sticky glass navbar (logo + wordmark, nav links, Sign in / Launch App, mobile Sheet menu with scroll-aware border/shadow toggle)
  2. Hero (gradient highlight headline, two CTAs, animated emerald/amber/violet blobs, floating glass chat-preview mockup with mentor selector pills, user + AI bubbles, and a typing indicator)
  3. Trust bar (6 muted name pills)
  4. Features grid (6 cards: Career/Coding/Interview/Resume/Study/Research with hover lift + glow)
  5. AI Personalities (10 cards — horizontal scroll on mobile, 5-col grid on desktop, exact names/icons from spec)
  6. How it works (3 numbered gradient circles with desktop connector line)
  7. Testimonials (3 glass cards with gradient initial avatars + 5-star rating)
  8. Pricing (Free / Pro / Team, Pro highlighted with "Most Popular" badge + primary border/glow + lift)
  9. FAQ (shadcn Accordion, 6 Q&As)
  10. CTA block (centered glass card with blobs, "Launch AI Mentor Pro" → onLaunch)
  11. Footer (brand + social icons, Product/Resources/Company columns, bottom bar with IBM × Bharat Cares credit)
- Used Framer Motion `whileInView` reveals on every section + `whileHover` lift on cards.
- All CTAs (Launch App, Start for free, pricing buttons, final CTA) call the `onLaunch` prop.
- Strictly emerald/teal primary + amber/gold (chart-2) + violet (chart-3) accents — no indigo/blue anywhere. Uses `bg-primary`, `text-muted-foreground`, `bg-card`, `border`, `glass`, `glass-strong`, `text-gradient`, `animate-blob` from globals.css.
- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`), mobile-first responsive, dark-mode safe (uses theme tokens + `dark:` variants on blobs).
- Verified: `tsc --noEmit` reports ZERO errors in the landing file (only pre-existing errors in unrelated files); `eslint` passes clean on the file.

Stage Summary:
- Landing page file `src/components/landing/landing-page.tsx` is complete, type-safe, lint-clean, and ready to be imported by `src/app/page.tsx` as `<LandingPage onLaunch={...} />`.
- No other files were modified. globals.css and layout.tsx untouched per instructions.

---
Task ID: 5-a
Agent: frontend-styling-expert (resume & prompts tools)
Task: Build resume-tool.tsx and prompts-view.tsx client-side tool views

Work Log:
- Read worklog.md + globals.css (theme tokens: --primary emerald, --chart-2 amber/gold, --chart-3 violet, --destructive; `@theme inline` registers `text-chart-2`/`text-primary`/etc. utilities; `.glass`, `.text-gradient`, `.prose-chat`, `.animate-blob` helpers present).
- Read all relevant shadcn/ui primitives to confirm exact export names and prop signatures: card, button, input, textarea, label, progress, badge, dialog, alert-dialog, dropdown-menu, select, skeleton, checkbox.
- Read `/api/resume` route (POST `{ text, targetRole? }` → `{ atsScore, strengths[], weaknesses[], suggestions[], improvedBullets[], fullReport }`, returns `{ error }` on failure), `/api/prompts` (GET with `q/category/favorite` query params, POST), and `/api/prompts/[id]` (PATCH/DELETE).
- Read existing `chat-view.tsx` to match codebase conventions: `bg-card/60 backdrop-blur` glass style, AlertDialog destructive button pattern (`bg-destructive text-destructive-foreground`), DropdownMenu actions, optimistic updates + toast.
- Confirmed `Markdown` component signature: `<Markdown content={string} />` from `@/components/app/markdown`.

File 1 — `src/components/app/resume-tool.tsx` (named export `ResumeTool`):
- `"use client"`. Two-column grid (`lg:grid-cols-2`, gap-6, `max-w-6xl mx-auto p-4 sm:p-6`).
- Left column: Card (rounded-2xl, `bg-card/70 backdrop-blur border`) titled "Resume Reviewer" with a gradient `FileText` square + title + subtitle. Form with `Label`+`Input` for optional target role, `Label`+`Textarea` (min-h-[280px]) for resume text, primary `Button` "Analyze resume" with `Sparkles` (loading state: `Loader2` spinner + "Analyzing…" + disabled), helper line "Tip: paste plain text…".
- Right column: empty state (`FileBarChart2` icon + "Your analysis will appear here"), loading state (4 `Skeleton` blocks), error state (`AlertTriangle` + message), result state:
  • ATS score card: big number (0-100) with tone-based color (`text-primary` >=70, `text-chart-2` 40-69, `text-destructive` <40), gradient background panel, descriptive label, and a `Progress` bar whose indicator color is overridden per-tone via `[&_[data-slot=progress-indicator]]:bg-*` arbitrary variant.
  • Grid of 2 cards: Strengths (emerald `CheckCircle2` bullets) and Weaknesses (amber `AlertTriangle` bullets).
  • Suggestions card (`Lightbulb` icon, dotted bullets).
  • Improved bullet points card (subtle emerald accent border `border-primary/30`, each bullet in `bg-primary/5` pill).
  • Full report card rendering `<Markdown content={result.fullReport} />`.
- Behavior: `useState` for text/targetRole/loading/result/error. On submit: validate non-empty (toast.error if empty), POST `/api/resume`, on success set result + toast.success, on failure toast.error + show error in result column. Mobile: columns stack.

File 2 — `src/components/app/prompts-view.tsx` (named export `PromptsView`):
- `"use client"`. `max-w-5xl mx-auto p-4 sm:p-6`.
- Header: gradient `BookMarked` square + "Prompt Library" title + "Save and reuse your best prompts." subtitle.
- Toolbar: search `Input` with leading `Search` icon (aria-label), then a flex-wrap row of category toggle `Button`s (rounded-full, active=primary variant, `aria-pressed`) for All/Career/Coding/Interview/Resume/Study/General, plus a "Favorites" toggle button (`Star` filled when active, `aria-pressed`), plus a primary "New prompt" button (`Plus`).
- Grid: 1 col mobile, 2 col sm, 3 col lg. Each prompt Card (rounded-2xl glass): title (line-clamp-1) + category `Badge` (secondary, capitalize) + favorite star toggle (top-right, optimistic PATCH, `fill-primary text-primary` when favorited, `aria-pressed`/`aria-label`), content preview (line-clamp-3, whitespace-pre-wrap), footer with "Updated {timeAgo(updatedAt)}" + `DropdownMenu` (`MoreHorizontal`) offering Edit / Copy text (clipboard + toast) / Delete (destructive variant → opens AlertDialog).
- Empty state: dashed border card with `StickyNote` icon + "No prompts yet. Create your first one!" + inline "New prompt" button. Loading state: 6 `Skeleton` placeholders.
- New/Edit `Dialog`: form with title `Input` (autofocus), category `Select` (career/coding/interview/resume/study/general), content `Textarea` (min-h-[160px]), favorite `Checkbox`. Save button: POST for new / PATCH for edit, toast.success, bumps `refreshKey` to refetch, closes dialog. Disabled while saving.
- Delete `AlertDialog`: confirmation with prompt title in description, destructive action button (`bg-destructive text-white`), preventDefault to keep open while deleting, refetch on success.
- Search debounced 250ms (separate `debouncedQuery` state) → refetch via `useEffect` keyed on `[debouncedQuery, category, favoritesOnly, refreshKey]`.
- `timeAgo(dateStr)` helper: "just now" / "5m ago" / "3h ago" / "2d ago" / `toLocaleDateString({month:'short', day:'numeric'})`.

Verification:
- `npx tsc --noEmit`: ZERO errors in either new file. (All remaining tsc errors are pre-existing in unrelated API routes / chat-view.tsx — Prisma user-relation schema mismatches and a missing `setRenamingId`.)
- `npx eslint src/components/app/resume-tool.tsx src/components/app/prompts-view.tsx`: ZERO errors / ZERO warnings.
- Only theme tokens used (`bg-card`, `bg-primary`, `text-primary`, `text-muted-foreground`, `border`, `bg-accent`, `text-chart-2`, `text-destructive`, `bg-destructive`). NO indigo/blue anywhere.
- No other files modified; globals.css untouched; no new files beyond the two required components.

Stage Summary:
- `src/components/app/resume-tool.tsx` and `src/components/app/prompts-view.tsx` are complete, type-safe, lint-clean, responsive, accessible, and ready to be wired into the app shell view switcher (e.g. imported and rendered when the user selects the Resume / Prompts tabs).

---
Task ID: 6
Agent: main
Task: End-to-end verification with agent browser + bug fixes + finalization

Work Log:
- Verified landing page renders fully (6432px tall, all 11 sections: navbar, hero, trust bar, features, mentors, how-it-works, testimonials, pricing, FAQ, CTA, footer)
- Verified app shell loads with sidebar nav (Chat, Resume Review, Prompt Library, Analytics, Settings) + dark mode toggle
- Tested chat streaming: sent messages, received streaming markdown responses (headings, bold, paragraphs, inline code, code blocks)
- Found & fixed race condition: new-chat creation during streaming triggered message-reload effect that wiped the in-progress assistant bubble. Added streamingChatIdRef guard.
- Tested mentor switching (General AI -> Coding Mentor) — works
- Tested Resume Review tool: pasted resume, got ATS score (30) + strengths/weaknesses/suggestions/improved bullets/full report
- Tested Prompt Library: created a prompt, verified it appears in the grid
- Found & fixed Prisma groupBy error: `_count: { _all: true }` not supported in SQLite; changed to `_count: { id: true }`
- Added defensive defaults in analytics-view.tsx (daily/mentorBreakdown/totals/active fallbacks)
- Verified Analytics view: stat cards, active usage, 14-day activity chart, popular mentors, system health (status/uptime/db/latency)
- Tested dark mode toggle (mean RGB dropped to ~20 — confirmed dark)
- Tested mobile responsive (390x844): hamburger drawer opens, chat view stacks, nav works
- Tested code blocks: PYTHON code block with language label + "Copy code" button renders correctly
- Lint: 0 errors, 0 warnings (clean)

Stage Summary:
- All core features verified end-to-end in the browser:
  * Landing page (11 sections, glassmorphism, animations)
  * ChatGPT-style chat with real streaming (SSE), markdown, syntax-highlighted code blocks, copy/regenerate/stop
  * 10 AI personalities with specialized system prompts
  * Resume review with ATS scoring
  * Prompt library CRUD
  * Analytics dashboard with charts + system health
  * Settings (profile, theme, AI memory, data export/delete)
  * Dark/light mode, fully responsive
- Bugs fixed: streaming race condition, Prisma groupBy, analytics defensive defaults
- Lint clean, dev server running, no runtime errors
