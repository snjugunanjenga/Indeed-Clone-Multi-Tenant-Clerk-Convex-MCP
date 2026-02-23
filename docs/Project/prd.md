## Product Requirements Document (PRD) – Jobly

### 1. Problem Statement

Knowledge workers and hiring teams struggle to efficiently match candidates with roles across many fragmented job boards. Existing platforms are noisy, slow to update, and offer limited transparency into the hiring pipeline, especially for smaller teams that lack dedicated ATS tools.

Jobly aims to provide a **modern, real‑time job marketplace** where:
- **Candidates** quickly discover relevant roles, maintain rich profiles, and track applications.
- **Employers** manage hiring pipelines inside multi‑tenant workspaces with clear plan limits and collaborative tools.

### 2. Target Users

- **Primary – Candidates**
  - Students, juniors, and experienced professionals looking for roles.
  - Pain points: fragmented search, weak feedback loops, limited visibility into application status.

- **Primary – Employers / Hiring Teams**
  - Startups, agencies, and small–mid companies who need a lightweight ATS‑like tool.
  - Pain points: ad‑hoc processes (spreadsheets/email), hard to track candidates across roles, limited real‑time visibility.

- **Secondary – Platform Admin / Operations**
  - Internal admin role (future) for moderating content, managing plans, and reporting.

### 3. Objectives & Success Metrics

#### 3.1 Product & Business Objectives

- Provide a smooth, real‑time hiring experience for both candidates and employers.
- Offer a production‑grade reference for Next.js 16 + Convex + Clerk multi‑tenant architecture.
- Evolve Jobly into a **Manatal-style recruitment platform** with:
  - A **versioned REST API** for recruiters and partners.
  - A rich object model for candidates, jobs, organizations, and matches.
  - Embedded AI capabilities for parsing, enrichment, recommendations, and semantic search.
- Enable monetization via organization‑level plans and value‑added features, including premium API & AI capabilities.

#### 3.2 Technical & Platform Objectives

- Keep **Convex** as the system of record for marketplace data and workflows.
- Keep **Clerk** as the source of truth for identity, organizations, roles, and billing entitlements.
- Expose a **stable `/api/v1` surface** that:
  - Uses API keys scoped to organizations and granular scopes (e.g. `read:candidates`, `write:jobs`, `ai:recommendations`).
  - Implements rate limiting, pagination, error formats, and file uploads in a way that is familiar to users of platforms like Manatal.
- Ensure the platform can scale to high‑volume API usage from recruiters and third‑party tools without compromising latency or tenant isolation.

#### 3.3 Success Metrics

- **Candidate side**
  - Time to first job application after sign‑up.
  - Number of saved jobs per active user.
  - Application completion rate per user.

- **Employer / recruiter side**
  - Number of active job listings per organization.
  - Time to first candidate review after posting.
  - Conversion from free → paid plans (Starter/Growth/Enterprise tiers).
  - Number of active API keys and integration partners per organization.

### 4. Core User Flows (v1 – already implemented at high level)

- **Candidate**
  1. Sign up / sign in via Clerk.
  2. Create or enhance profile (experience, education, skills, resumes, links).
  3. Discover jobs via search + filters; save jobs to favorites.
  4. Apply with selected resume and optional cover letter.
  5. Track application status in real time and receive notifications.

- **Employer / Company Workspace**
  1. Create or join a company workspace (Clerk Organization).
  2. Select a plan (Free / Starter / Growth) and invite team members.
  3. Post jobs using rich text editor and structured fields (location, salary, tags).
  4. Review applicants, move them through the pipeline, and auto‑notify candidates.
  5. Monitor usage against plan limits (seats, active jobs) and manage billing.

### 5. Scope – Must / Should / Could

- **Must‑have (MVP – largely covered today)**
  - Auth and organizations with Clerk (including org membership roles).
  - Candidate area with job search, favorites, applications, profile management.
  - Employer area with workspace, job posting, application review, basic billing hooks.
  - Real‑time updates via Convex (notifications, application status, job updates).

- **Should‑have (near‑term)**
  - Clear test coverage for critical flows (auth, job creation, applying, status changes).
  - Basic analytics for employers (views, applications per job).
  - Feature gating by plan (e.g., advanced filters or additional seats).

- **Could‑have (future)**
  - AI‑assisted features (job recommendations, auto‑tagging, resume parsing, cover letter generation).
  - Email notifications and digests.
  - Admin console for moderation and platform‑level metrics.

### 6. Non‑Goals (for now)

- Building a full ATS that replaces specialized tools in large enterprises.
- Managing payments outside Clerk Billing (e.g., custom invoices, bank transfers).
- Marketplace‑wide recommendations across many separate white‑label tenants.

### 7. Manatal‑Style API & Scaling Requirements

#### 7.1 Object Model Parity

The system must support Manatal‑like object coverage:

- **Core objects**
  - Candidates: profiles, resumes, experiences, education, certifications, skills, social links, nationalities.
  - Jobs: job postings with structured fields, notes, activities, attachments, and matching signals.
  - Organizations: company workspaces (via Clerk Organizations) with plan and seat limits.
  - Matches: candidate↔job relationships, modeled via enriched applications and/or a dedicated `matches` abstraction.
- **Sub‑resources**
  - Candidate‑level: notes, activities, attachments, social profiles, nationalities.
  - Job‑level: notes, activities, attachments, matches.
- **Taxonomies**
  - Languages, industries, currencies, nationalities, match stages, and job pipeline stages.

All of these concepts should be explicitly representable in Convex so that a REST API can expose them in a way similar to Manatal’s `/candidates/*`, `/jobs/*`, `/organizations/*`, `/matches/*`, and taxonomy endpoints.

#### 7.2 REST API Surface (v1)

Jobly must provide a versioned REST API under `/api/v1`:

- **Jobs**
  - `GET /api/v1/jobs` – list jobs with filters, pagination, and sorting.
  - `POST /api/v1/jobs` – create a job listing.
  - `GET /api/v1/jobs/{id}` – fetch a single job.
  - `PATCH /api/v1/jobs/{id}` – update a job (including status).
- **Candidates**
  - `GET /api/v1/candidates` – list candidates with filters and pagination.
  - `POST /api/v1/candidates` – create a candidate (optionally with resume).
  - `GET /api/v1/candidates/{id}` – fetch a single candidate.
  - `PATCH /api/v1/candidates/{id}` – update candidate fields.
- **Sub‑resources**
  - `/api/v1/candidates/{id}/educations|experiences|attachments|notes|social-media`
  - `/api/v1/jobs/{id}/attachments|notes|matches`
- **Career page‑style endpoints**
  - `GET /api/v1/career/{orgSlug}/jobs`
  - `GET /api/v1/career/{orgSlug}/jobs/{jobId}`
  - `GET /api/v1/career/{orgSlug}/jobs/{jobId}/application-form`
  - `POST /api/v1/career/{orgSlug}/jobs/{jobId}/apply`

All endpoints must:

- Use org‑scoped API keys with scopes for authorization.
- Implement standard pagination (page/size or cursor + `next`/`prev` links).
- Return consistent error shapes and status codes.

#### 7.3 Embedded AI Capabilities

AI features must be delivered through core endpoints, not via a separate AI namespace:

- **Parsing & enrichment**
  - On `POST /api/v1/candidates` (and relevant updates), if a resume is provided:
    - Extract text and call an AI model.
    - Populate structured educations, experiences, skills, seniority, and optional social/profile hints.
  - Parsed structures are exposed via the same candidate sub‑resources as manually entered data.
- **Recommendations & matches**
  - `GET /api/v1/jobs/{jobId}/candidates` returns candidates ranked by AI‑derived match score with optional explanation.
  - `GET /api/v1/candidates/{id}/jobs` returns recommended jobs ranked by relevance.
- **Semantic search**
  - `search` parameters on list endpoints (jobs, candidates) produce semantic ranking and a `relevance_score` field in responses.

AI usage must be **rate‑limited**, **cached** where appropriate, and always respect org scoping and entitlements.

#### 7.4 Plans, Entitlements, and Limits

- **Free**
  - Basic internal API usage and limited read access to jobs and candidates.
  - No AI parsing or recommendations.
- **Starter**
  - Higher API rate limits.
  - Access to resume parsing and basic profile enrichment.
- **Growth / Enterprise**
  - Full CRUD API across all objects and sub‑resources.
  - AI‑powered recommendations and semantic search.
  - Webhooks, higher rate limits, and priority processing for heavy AI workloads.

Plan and feature entitlements are driven by **Clerk Billing** and enforced:

- At the API layer (what endpoints/scopes are available).
- Within Convex functions (what actions an org is allowed to perform).

#### 7.5 Phased Delivery

- **Phase 1 – Object model parity in Convex**
  - Extend the Convex schema to cover all required Manatal‑like objects and taxonomies.
- **Phase 2 – REST API v1 (jobs & candidates + sub‑resources)**
  - Implement `/api/v1/jobs` and `/api/v1/candidates` plus core sub‑resources, with API key auth and pagination.
- **Phase 3 – Career page & public endpoints**
  - Implement organization‑specific job listing and application APIs for public career pages.
- **Phase 4 – AI parsing, enrichment, and recommendations**
  - Add AI‑backed parsing, semantic search, and ranking into existing endpoints.
- **Phase 5 – Webhooks & integration ecosystem**
  - Implement webhook management and stable event contracts for external integrations built on top of Jobly.

