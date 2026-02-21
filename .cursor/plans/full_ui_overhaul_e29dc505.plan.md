---
name: Full UI Overhaul
overview: Redesign every UI surface of the Jobly app with a "Warm Professional" aesthetic and friendly UX -- distinctive typography (Bricolage Grotesque + Figtree), warm terracotta accents, clear wayfinding, strong visual hierarchy, and helpful contextual guidance -- while preserving all existing functionality, data flows, and permission guards.
todos:
  - id: phase1-foundation
    content: Rewrite globals.css with warm professional color palette, subtle grain texture, keyframe animations, and custom utility classes. Swap fonts in layout.tsx to Bricolage Grotesque + Figtree via next/font/google.
    status: completed
  - id: phase2-landing
    content: Full redesign of app/page.tsx -- clear two-path hero (job seekers vs employers), warm card compositions, staggered entrance animations, friendly copy. Preserve all Clerk auth buttons and navigation links.
    status: completed
  - id: phase3-auth
    content: Restyle sign-in and sign-up pages with warm atmospheric backgrounds, centered card treatment, and welcoming copy.
    status: completed
  - id: phase4-candidate
    content: Redesign candidate layout with sticky sidebar nav + active route indicators, and all 5 candidate pages with improved hierarchy, contextual empty states, and warm professional styling. Preserve all data flows.
    status: completed
  - id: phase5-company
    content: Redesign company layout with clear org-context header and role-aware nav, plus all 5 company pages and 2 shared components with guided UX, clearer action hierarchy, and warm professional styling. Preserve all Protect guards and permission checks.
    status: completed
  - id: phase6-pricing
    content: Restyle pricing page wrapper with friendly onboarding flow while preserving all Clerk components.
    status: completed
  - id: phase7-verify
    content: Run pnpm lint and pnpm build to confirm no functional regressions. Fix any linter errors introduced.
    status: completed
isProject: false
---

# Full UI Overhaul -- "Warm Professional" Direction

## Design Direction

**Aesthetic**: Warm Professional -- inspired by Stripe and Vercel's approachability paired with editorial typographic confidence. Clean, generous, and purposeful. Every element guides the user toward the next logical action. Not a generic SaaS template -- it should feel premium and hand-crafted while being immediately intuitive.

**What makes it unforgettable**: The pairing of Bricolage Grotesque's characterful letterforms with warm terracotta accents on a cream background creates a distinctive "printed quality" -- warm and trustworthy. Combined with exceptional wayfinding (you always know where you are and what to do next), it becomes a job board that feels genuinely pleasant to use.

**Tone**: Warm but professional. Approachable yet trustworthy. Like a well-designed coworking space -- everything in its right place, nothing intimidating, subtle touches of delight.

---

## UX Principles (applied to every page)

### 1. Clear Wayfinding

- **Persistent context**: Users always see where they are (candidate side vs company side) via distinct visual treatments -- warm cream for candidates, slightly different header treatment for company
- **Active route indicators**: Current page is visually highlighted in nav with a filled pill/underline, not just a subtle text change
- **Breadcrumb context**: Page headers include a short descriptor so users never feel lost (e.g., "Jobs / Senior Engineer at Acme" on detail pages)
- **Cross-side navigation**: Landing page clearly separates the two paths (seeking vs hiring) with distinct CTAs and visual zones

### 2. Visual Hierarchy (Scannable at a Glance)

- **Primary action prominence**: Each page has ONE clear primary CTA that stands out (terracotta button). Secondary actions are outlined/ghost.
- **Card hierarchy**: Most important info (job title, status, company name) is large and dark. Supporting info (location, date, type) is smaller and muted. Actions are bottom-right.
- **Section grouping**: Related content grouped with subtle background fills and clear section headings with optional descriptions
- **Badge system**: Consistent, color-coded status badges across the entire app -- jade green for positive (active, accepted, open to work), amber for pending/warning, red for negative (rejected, closed), neutral gray for informational

### 3. Contextual Guidance

- **Empty states with direction**: Every list page has a helpful empty state with an icon, friendly message, and a CTA to the logical next action (e.g., "No saved jobs yet -- browse openings to find your next role")
- **Form helper text**: Input fields include brief descriptions where the purpose isn't obvious
- **Loading states**: Skeleton-style loading that matches the page layout shape, not a generic spinner
- **Section intros**: Dashboard/list pages open with a one-line sentence explaining what the section is for

### 4. Friendly Micro-Copy

- Page titles and descriptions use warm, human language (not corporate jargon)
- Button labels are action-oriented: "Save this job" not "Add to favorites", "Submit application" not "Apply"
- Error states include recovery guidance

---

## Typography

- **Display/Headings**: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) -- quirky, asymmetric letterforms with editorial character. Variable weight 200-800.
- **Body/UI**: [Figtree](https://fonts.google.com/specimen/Figtree) -- clean geometric sans with subtle warmth. Excellent readability at small sizes.
- Both loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx), replacing the current Geist fonts.
- Heading sizes follow a clear scale: page titles are large (text-3xl/4xl), section headers are medium (text-xl), card titles are standard (text-lg), with consistent tracking-tight on headings.

## Color System (via CSS variables in [app/globals.css](app/globals.css))

**Light mode (default)**:

- Background: `#FAFAF8` (warm cream)
- Card/Surface: `#FFFFFF`
- Primary: `#1A1523` (deep eggplant-black)
- Primary foreground: `#FAFAF8`
- Accent/CTA: `#E54D2E` (terracotta -- used for primary action buttons)
- Success states: `#30A46C` (jade green)
- Warning: `#E5A00D` (amber)
- Destructive: `#E5484D` (warm red)
- Muted text: `#706F6C`
- Borders: `#E8E8E3`
- Subtle backgrounds/muted: `#F5F5F0`

**Dark mode**:

- Background: `#111110` (warm near-black)
- Card/Surface: `#1C1C1A`
- Primary: `#EEEEEC`
- Accent: `#F76B15` (warm orange, brighter for dark bg)
- Borders: `#2E2E2C`

## Motion and Texture

- CSS `@keyframes` for staggered fade-in reveals on page load (no new deps)
- Subtle CSS noise/grain overlay on the body background for texture
- Warm box-shadows (slightly tinted, not pure gray)
- Navigation links with smooth animated underline on hover/active
- Card hover states with gentle lift + shadow expansion
- Button press states with subtle scale-down for tactile feedback

## Spatial Composition

- Generous padding and whitespace throughout
- Candidate layout: sidebar-style nav on desktop (or top pill bar on mobile) with content area
- Company layout: clear org-context banner at top, horizontal nav below
- Cards with larger border-radius (rounded-2xl) and warm shadows
- Consistent card padding and spacing grid (gap-4 between cards, p-6 inside)
- Status badges as bold, color-coded pills

---

## Scope: Files to Modify (20 files, 0 new files)

All changes are purely presentational (Tailwind classes, CSS variables, fonts, layout structure, copy). No Convex queries, mutations, Clerk hooks, permission checks, or data flow logic will be altered.

### Phase 1: Design Foundation (2 files)

- [app/globals.css](app/globals.css) -- Replace entire color system with warm professional palette, add grain texture, add keyframe animations (fade-in, slide-up, stagger), custom utility classes for the badge system
- [app/layout.tsx](app/layout.tsx) -- Swap Geist fonts for Bricolage Grotesque + Figtree, update metadata title to "Jobly" with proper description

### Phase 2: Landing Page (1 file)

- [app/page.tsx](app/page.tsx) -- Full redesign: clear two-path hero (left: job seekers with search CTA, right: employers with company CTA), warm card compositions, staggered entrance animations, friendly welcoming copy. Stats section redesigned as trust-building social proof. All existing Clerk auth buttons and links preserved.

### Phase 3: Auth Pages (2 files)

- [app/sign-in/[[...sign-in]]/page.tsx](app/sign-in/[[...sign-in]]/page.tsx) -- Warm atmospheric background, centered card, welcoming "Welcome back" heading, subtle branding
- [app/sign-up/[[...sign-up]]/page.tsx](app/sign-up/[[...sign-up]]/page.tsx) -- Match sign-in, with "Join Jobly" heading

### Phase 4: Candidate Shell + Pages (6 files)

- [app/(app)/layout.tsx](app/(app)/layout.tsx) -- Redesign as polished app shell: branded header with "Jobly" logo, horizontal pill-nav with active route highlighting (using `usePathname()`), UserButton, and a Home link. Clear "Candidate" context indicator.
- [app/(app)/jobs/page.tsx](app/(app)/jobs/page.tsx) -- Restyle: section intro text, filter bar as a cohesive card, job cards with clear hierarchy (title prominent, metadata muted, save button accessible), empty state with CTA. All query/mutation logic untouched.
- [app/(app)/jobs/[jobId]/page.tsx](app/(app)/jobs/[jobId]/page.tsx) -- Restyle: clear two-column (job info left, apply form right), breadcrumb-like back link, prominent apply section, descriptive helper text on form fields. All data flows untouched.
- [app/(app)/applications/page.tsx](app/(app)/applications/page.tsx) -- Restyle: section intro, status-grouped cards with color-coded badges, contextual empty state ("No applications yet -- find your next opportunity"). All mutation logic untouched.
- [app/(app)/favorites/page.tsx](app/(app)/favorites/page.tsx) -- Restyle: section intro, clean card grid, contextual empty state ("Nothing saved yet -- browse jobs to bookmark roles you like"). All mutation logic untouched.
- [app/(app)/profile/page.tsx](app/(app)/profile/page.tsx) -- Restyle: clear section grouping (personal info / resume / preferences), helper descriptions on fields, completion indicator feel. All form/mutation logic untouched.

### Phase 5: Company Shell + Pages (7 files)

- [app/company/layout.tsx](app/company/layout.tsx) -- Redesign: org-context banner (org name via OrganizationSwitcher prominent), horizontal nav with active indicators, role-aware items still gated by `Protect`. Clear "Company Workspace" branding.
- [app/company/page.tsx](app/company/page.tsx) -- Restyle: welcome section with org context, summary cards as a metrics row, feature cards with clear hierarchy and guided CTAs. All `has()` checks preserved.
- [app/company/_components/company-summary-cards.tsx](app/company/_components/company-summary-cards.tsx) -- Restyle as a polished metrics row with icons, large numbers, and muted labels.
- [app/company/jobs/page.tsx](app/company/jobs/page.tsx) -- Restyle: section intro, job cards with status badges and clear action buttons, empty state with "Post your first job" CTA. All mutation logic untouched.
- [app/company/jobs/new/page.tsx](app/company/jobs/new/page.tsx) -- Restyle: stepped feel with clear field grouping (basics / details / settings), helper descriptions on fields, friendly submit CTA. All form/mutation logic untouched.
- [app/company/applications/page.tsx](app/company/applications/page.tsx) -- Restyle: filter bar, application cards with prominent candidate info and clear decision buttons (accept = jade, reject = red), section intro. All mutation logic untouched.
- [app/company/billing/page.tsx](app/company/billing/page.tsx) -- Restyle: clear plan status section, access cards as a clean grid, usage cards prominent. All Clerk `PricingTable` and `Protect` guards preserved.

### Phase 6: Remaining Pages + Components (2 files)

- [app/pricing/page.tsx](app/pricing/page.tsx) -- Restyle: friendly intro copy, clear org-creation guidance for first-time users, warm wrapper around Clerk components. All Clerk components preserved.
- [app/company/_components/billing-usage-cards.tsx](app/company/_components/billing-usage-cards.tsx) -- Restyle: progress bars with warm colors (jade for healthy, amber for near-limit), clear number labels, friendly warning copy.

### Phase 7: Verification

- Run `pnpm lint` and `pnpm build` to confirm no regressions
- Check for any linter errors in modified files
- Spot-check that all pages render correctly

---

## Functional Preservation Rules

- **Zero changes** to any file inside `convex/`
- **Zero changes** to `proxy.ts` (middleware)
- **Zero changes** to `components/ConvexClientProvider.tsx`
- All `useQuery`, `useMutation`, `useForm`, `useState`, and data-handling code within pages stays exactly as-is
- All Clerk components (`SignIn`, `SignUp`, `UserButton`, `OrganizationSwitcher`, `Protect`, `PricingTable`, `CreateOrganization`) stay in their current positions with their current props
- All `has()` checks and `auth()` calls in server components stay untouched
- All `Link` destinations and `Button asChild` patterns stay the same
- shadcn/ui component imports stay the same (we restyle via CSS variables and Tailwind classes, not by modifying component internals)

