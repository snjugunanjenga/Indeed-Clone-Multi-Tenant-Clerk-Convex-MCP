## Project Overview – Jobly (Existing Implementation)

This document summarizes the **current state of the Jobly app** as implemented in this repository, before we introduce any new roadmap items or scaling work. It is derived solely from the existing codebase and top-level docs.

---

## 1. High-Level Summary

- **Product**: Two‑sided job board ("Jobly") for **candidates** and **employers**.
- **Domain**:
  - Candidates search and filter jobs, manage profiles, upload resumes, apply, and track application status.
  - Employers manage company workspaces, post jobs, review candidates, manage hiring pipelines, invite teammates, and manage billing/plan limits.
- **Architecture style**: **Next.js 16 App Router** frontend + **Convex** reactive backend + **Clerk** for auth/organizations/billing, with real‑time updates to the client.

---

## 2. Current Architecture (Codebase-Derived)

### 2.1 Folder Layout (Relevant Today)

- `app/`
  - Next.js 16 **App Router** entrypoint and routes.
  - Route groups:
    - `app/(app)/` – candidate‑facing app (jobs, applications, favorites, profile, notifications).
    - `app/company/` – employer/company workspace (dashboard, jobs, applications, billing, plan sync).
    - `app/pricing/` – pricing page using Clerk Billing `PricingTable`.
    - Auth entrypoints: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`.
    - Server/utility routes: `app/server/page.tsx`, `app/server/inner.tsx`, `app/app/page.tsx`, root `app/page.tsx`, top-level `app/layout.tsx`, and grouped layout `app/(app)/layout.tsx`.
- `convex/`
  - Backend domain logic and data access:
    - `schema.ts` – Convex schema + indexes for users, profiles, companies, job listings, applications, favorites, notifications, etc.
    - `jobs.ts` – job listing queries/mutations.
    - `applications.ts` – application lifecycle: submit, update status, track pipeline.
    - `profiles.ts` – candidate profile CRUD and related entities (experience, education, certifications, resumes).
    - `companies.ts` & `lib/companies.ts` – company/workspace + membership + plan limits.
    - `favorites.ts` – favorite jobs per user.
    - `notifications.ts` – in‑app notifications.
    - `http.ts` – HTTP endpoint(s) including Clerk webhook handler.
    - `sync.ts` – sync logic wired to Clerk webhooks (users, orgs, org memberships, plans).
    - `auth.config.ts`, `lib/auth.ts` – Convex auth integration for Clerk.
    - `seed.ts` – dev‑time data seeding.
    - `_generated/*` – Convex generated API and typing.
- `components/`
  - Shared React components:
    - `ConvexClientProvider.tsx` – wraps the app with Convex client/provider.
    - `notification-bell.tsx` – notifications UI.
    - `site-logo.tsx` – branding/logo element.
    - `rich-text-editor.tsx`, `rich-text-display.tsx` – Tiptap editor & renderer for job descriptions and rich text.
  - `components/ui/` – shadcn/ui primitives (button, card, input, select, popover, textarea, checkbox, badge, form, label, etc.).
- `lib/`
  - `utils.ts` – Tailwind class merging and general utilities (e.g., `cn`).
  - `use-debounced-value.ts` – debounce hook for search/filter inputs.
  - `strip-html.ts` – helper to strip HTML for search/indexing or previews.
- Root config and tooling:
  - `package.json` – Next 16 + Convex + Clerk + Tailwind v4 + shadcn/ui, dev scripts.
  - `tsconfig.json` – strict TypeScript, Next.js plugin, `@/*` path alias.
  - `next.config.ts` – image domain config (`i.pravatar.cc`).
  - `postcss.config.mjs`, `tailwindcss` in `devDependencies` – Tailwind v4 setup.
  - `eslint.config.mjs` – ESLint with `eslint-config-next` and `@convex-dev/eslint-plugin` (not detailed here).
  - `.gitignore` – standard Node/Next ignores.
  - `proxy.ts` – Next 16 `proxy.ts` middleware that integrates Clerk auth and route protection.

### 2.2 Runtime Architecture (Mermaid)

This architecture diagram is adapted from the existing `README.md` and reflects the current implementation.

```mermaid
flowchart TB
    Browser[Next.js 16 App Router\n(React Server + Client Components)] -->|"convex/react hooks\n(useQuery, useMutation)"| Convex[Convex Backend\nFunctions + Schema]
    Convex -->|"Real-time sync\n(observables)"| Browser

    Clerk[Clerk Auth + Orgs + Billing] -->|"Svix Webhooks"| ConvexHTTP[Convex HTTP Endpoint\nconvex/http.ts]
    ConvexHTTP -->|"Sync users, orgs,\norg memberships, plans"| Convex

    Convex -->|"File storage\n(resumes, assets)"| Storage[Convex Storage]

    Browser -->|"proxy.ts middleware\n(Clerk, org routing)"| Clerk
```

---

## 3. Tech Stack (As Implemented)

**Core stack**

- **Next.js 16** App Router (`app/`), route groups `(app)` and `company`.
- **React 19** with strict TypeScript configuration.
- **Convex** for:
  - Database and schema management (`convex/schema.ts`).
  - Reactive queries/mutations + generated client.
  - Storage for file uploads (resumes).
  - HTTP endpoints (webhooks).
- **Clerk** for:
  - Authentication and user management.
  - Organizations (multi‑tenant workspaces).
  - Billing (PricingTable and plan metadata).
  - Webhooks (Svix) to Convex.
- **UI & styling**
  - **Tailwind CSS v4** for styling.
  - **shadcn/ui** components in `components/ui`.
  - **Tiptap** rich text editor for job descriptions.
- **Forms & validation**
  - **React Hook Form** + **Zod** for schema‑driven, type‑safe forms.

**Tooling**

- **TypeScript** strict mode.
- **ESLint 9** + `eslint-config-next` + `@convex-dev/eslint-plugin`.
- **Prettier** for formatting.
- **npm-run-all2** for parallel dev (`dev:frontend`, `dev:backend`).
- Package manager: **pnpm** (recommended in README).

---

## 4. Entry Points & Execution Flow

- **Frontend dev entry**:
  - `pnpm dev` → `dev` script:
    - `dev:frontend` → `next dev`
    - `dev:backend` → `convex dev`
- **Production**:
  - `pnpm build` → `next build`
  - `pnpm start` → `next start` (Next.js app using Convex hosted backend).
  - `npx convex deploy` for Convex production deployment.

**Key runtime files**

- `app/layout.tsx` – root layout, global providers (including Convex + Clerk wrappers).
- `app/(app)/layout.tsx` – candidate‑experience layout + navigation.
- `app/company/layout.tsx` – employer workspace layout + navigation & access control.
- `proxy.ts` – central route protection/auth integration with Clerk for Next.js 16.
- `convex/http.ts` – HTTP handler for Clerk webhooks and other HTTP‑style endpoints.

---

## 5. Functional Areas (Current Features)

Based on `README.md` and the `app/` + `convex/` folders, the app currently supports:

- **Job seeker features**
  - Browse/search/filter jobs (`app/(app)/jobs/page.tsx` + `convex/jobs.ts`).
  - Manage favorites (`app/(app)/favorites/page.tsx` + `convex/favorites.ts`).
  - Build and edit profile (`app/(app)/profile/page.tsx` + `convex/profiles.ts` and related tables).
  - Upload/manage resumes via Convex storage.
  - Apply to jobs and track statuses (`app/(app)/applications/page.tsx` + `convex/applications.ts`).
  - View notifications (`app/(app)/notifications/page.tsx` + `convex/notifications.ts`).

- **Employer / company features**
  - Company dashboard (`app/company/page.tsx` + summary components).
  - Post and edit jobs (`app/company/jobs/new/page.tsx`, `app/company/jobs/[jobId]/edit/page.tsx`, and `convex/jobs.ts`).
  - View and manage applications (`app/company/applications/page.tsx` + `convex/applications.ts`).
  - Team invitations and membership management (`app/company/_components/invite-member-section.tsx` + `convex/companies.ts` / `convex/lib/companies.ts`).
  - Billing and usage:
    - Billing page (`app/company/billing/page.tsx`).
    - Usage cards and plan limits (`billing-usage-cards`, `sync-company-plan.tsx`).
    - Pricing page (`app/pricing/page.tsx`) powered by Clerk billing.

- **Cross-cutting**
  - Auth & onboarding flows: Next.js routes in `app/sign-in/*`, `app/sign-up/*` wired to Clerk.
  - Real‑time notification system (Convex + UI bell component).
  - Multi‑tenant organization routing via Clerk Organizations.

---

## 6. Environment & Configuration (Current)

From `README.md` and `package.json`, the current env model:

- **Env files**
  - `.env.example` and `.env.local` (mentioned in README; `.env.example` is expected to already exist or be generated).
- **Core environment variables**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
  - `NEXT_PUBLIC_CONVEX_URL`
  - `CLERK_JWT_ISSUER_DOMAIN`
  - `CLERK_WEBHOOK_SIGNING_SECRET`

These must be defined both locally (`.env.local`) and appropriately in **Vercel** and **Convex** environments for production deployments.

---

## 7. Current Deployment & CI/CD Story

There is **no dedicated CI/CD folder** in the repo today, but the `README.md` outlines the deployment story:

- **Frontend hosting**: Vercel is the primary target.
  - Manual or GitHub‑connected deploys via Vercel Dashboard.
  - Env vars added via Vercel Project Settings.
- **Backend deployment**: Convex.
  - `npx convex deploy` to promote schema and functions to production.
  - Env vars (including `CLERK_WEBHOOK_SIGNING_SECRET`) configured directly in Convex dashboard.
- **Clerk**:
  - Production API keys, organizations, billing, and webhooks configured via Clerk dashboard.

**CI/CD gap (today)**: there is no `github/workflows/` configuration yet. Automated tests, linting, or Convex deploys are not wired into CI.

---

## 8. Decisions Log (Existing State)

This section documents **decisions already reflected in the codebase** (not future plans).

1. **Use Convex instead of a traditional DB layer**
   - Rationale: Built‑in real‑time data sync and tight integration with TypeScript and React.
   - Impact: All backend logic is encoded as Convex functions; no separate REST/GraphQL layer.

2. **Use Clerk for auth, organizations, and billing**
   - Rationale: Offload auth, org roles, and subscription management to a managed provider.
   - Impact: Deep integration via webhooks, JWTs, and middleware (`proxy.ts`).

3. **Multi‑tenant model via Clerk Organizations**
   - Rationale: Each company workspace is modeled as a Clerk organization, avoiding bespoke tenancy handling.
   - Impact: Org membership and roles drive access control, plan limits, and routing under `app/company/*`.

4. **Next.js 16 App Router with route groups**
   - Rationale: Modern Next features (server components, layouts, route groups) and clear separation between candidate and employer experiences.
   - Impact: `(app)` and `company` route groups with distinct layouts and navigation.

5. **Tailwind CSS v4 + shadcn/ui**
   - Rationale: Fast, consistent UI development with accessible primitives.
   - Impact: Centralized design tokens and utilities, plus consistent UI patterns.

6. **TypeScript strict mode**
   - Rationale: Catch more bugs at compile time and keep a strongly‑typed end‑to‑end experience across Next + Convex.
   - Impact: Requires proper typing of Convex functions, React components, and util modules.

---

## 9. Known Gaps & Next-Step Inputs for Roadmap

The following are **process/architecture gaps** visible from the current repo and docs that we can address when we move into roadmap/scaling work:

- **Testing**
  - No Jest/Vitest configuration or test suite present yet.
  - No coverage reporting or testing docs.

- **CI/CD**
  - No `github/workflows/` pipelines for linting, testing, or automated deploys.
  - No automated Convex deploy integration.

- **Observability & Ops**
  - No explicit logging/monitoring strategy in the repo.
  - No rate limiting or abuse‑prevention layer implemented yet (mentioned as a future idea in README).

- **Docs structure**
  - Main documentation is centralized in `README.md`.
  - No dedicated `docs/Project/*` hierarchy yet; this file is the first step toward that structure.

These gaps will inform the **future roadmap docs** (`roadmap.md`, `testing.md`, `final-review.md`, etc.) that we will introduce next.

