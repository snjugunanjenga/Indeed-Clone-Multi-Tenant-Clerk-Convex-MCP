## Engineering Requirements & Plan (ERP) – Jobly

### 1. Architectural Requirements

- **Tech stack**
  - Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4.
  - Convex for database, real‑time queries/mutations, storage, HTTP endpoints.
  - Clerk for auth, organizations, and billing.

- **Quality attributes**
  - **Reliability**: Avoid data loss across job postings, applications, and notifications; rely on Convex schema/type safety.
  - **Performance**: Sub‑second perceived latency for main interactions (navigation, filtering, pipeline updates).
  - **Security**: Role‑based access control on all employer endpoints; tenant isolation via Clerk Organizations.
  - **Scalability**: Be able to scale organizations and job volume by:
    - Having appropriate indexes in Convex (`schema.ts`).
    - Using server components and streaming where possible.
  - **Maintainability**: Clear separation of concerns between `app/`, `convex/`, `components/`, and `lib/`.

### 2. Functional Requirements (Engineering View)

- **Auth / Organizations**
  - All pages under `app/(app)/` and `app/company/` must enforce Clerk auth via `proxy.ts` and server checks.
  - Company views must validate organization membership and role (admin, recruiter, member).
  - Webhooks from Clerk must sync users, organizations, and memberships into Convex (`convex/http.ts`, `convex/sync.ts`).

- **Job Listings & Search**
  - Convex schema must define indexes for search text, filters (location, employment type, workplace type, tags, active status).
  - Search API must support debounced text queries and filters (see `lib/use-debounced-value.ts`).
  - Job listing mutations must enforce plan‑based limits (free vs paid plans).

- **Applications & Pipeline**
  - Candidates can only apply if authenticated and have at least one resume uploaded.
  - Status transitions must be constrained to valid states (Submitted → In Review → Accepted / Rejected / Withdrawn).
  - Employer actions on applications must emit notifications to candidates.

- **Profiles & Resumes**
  - Profile data must be normalized across related Convex tables (experiences, education, certifications, resumes).
  - Resume storage must use Convex file storage with secure URLs and reasonable file size limits.

- **Billing & Limits**
  - Plan data must be read from Clerk Billing / org metadata and synced into Convex (companies + limits).
  - Enforcement for:
    - Maximum active jobs.
    - Maximum seats per plan.

### 3. Testing Requirements

- Introduce a **test runner** (Jest or Vitest) for:
  - Critical UI components (form validation, error states).
  - Convex functions (domain logic and authorization).
  - Integration tests for core flows (sign in, post job, apply, status updates) using mocks where appropriate.

- Establish:
  - `npm test` / `pnpm test` script.
  - Coverage thresholds (e.g., 70%+ for core domains: jobs, applications, profiles, companies).

### 4. Operational Requirements

- **Environments**
  - At minimum: local, staging (optional), production.
  - Configuration via `.env.local` (local), Vercel project settings, and Convex environment variables.

- **Monitoring & Logging (future)**
  - Add structured logging in Convex actions/mutations for critical events (webhook failures, billing sync failures).
  - Integrate with a hosted log solution or Convex dashboard usage for troubleshooting.

### 5. Implementation Plan (High Level)

1. **Stabilize documentation & config**
   - Maintain `.env.example` and `.env.local` as single source of truth for configuration.
   - Keep `docs/Project/*` updated as new decisions are made.

2. **Introduce testing & CI**
   - Choose a test runner (Jest or Vitest).
   - Add basic tests and GitHub Actions workflow for lint + tests on each PR.

3. **Harden multi‑tenancy and authorization**
   - Audit all Convex functions for role checks and organization scoping.
   - Add tests for unauthorized access cases.

4. **Prepare for scaling**
   - Validate Convex indexes for the most common query patterns.
   - Introduce pagination and incremental loading where necessary.

