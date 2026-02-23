## Manatal-Style API & AI Scaling Plan – Jobly

This document describes how to evolve Jobly into a **Manatal-style recruitment API platform**: a REST API for recruiters and integrators, with embedded AI capabilities for parsing, recommendations, and semantic search, built on top of the existing Next.js + Convex + Clerk architecture.

---

## 1. Goals & Scope

- **Goals**
  - Expose a stable, authenticated **REST API** for recruiters and partners (similar to Manatal).
  - Embed **AI features inside core resources** (candidates, jobs, parsing, recommendations) rather than as separate “AI-only” endpoints.
  - Preserve Jobly’s existing multi-tenant model (Clerk Organizations) and Convex data model as the system of record.

- **Out of Scope (initially)**
  - Fully replicating Manatal’s entire API surface.
  - Complex third-party ATS integrations (beyond simple data sync).

---

## 2. High-Level Architecture

```mermaid
flowchart LR
  Client[Recruiter Integrations\n(servers, tools, scripts)] -->|"HTTPS + API Key"| API[Jobly REST API\n(Next.js /api or Route Handlers)]
  API -->|"RPC/HTTP calls"| Convex[Convex Functions\n(queries, mutations, actions)]
  Convex --> DB[(Convex Tables)]

  API -->|"Server-side calls"| AI[AI Providers\n(OpenAI/Anthropic/etc.)]
  Convex -->|"Context data\n(candidates, jobs)"| API
  AI -->|"Parsed data,\nrankings, scores"| API --> Convex

  Clerk[Clerk Auth + Orgs + Billing] --> API
  Clerk --> Convex
```

**Key ideas**
- API layer is built as **RESTful route handlers** in Next.js that **delegate to Convex** for data and business logic.
- AI is surfaced as:
  - **Parsed/enriched fields** on candidates and jobs.
  - **Ranking, scoring, and recommendations** in list endpoints.

---

## 3. Authentication & Tenancy Model (API Keys)

### 3.1 API Keys for Recruiters

- Introduce an `apiKeys` table in Convex (or equivalent) with:
  - `key` (hashed API key token).
  - `organizationId` (Clerk org ID or mapped company ID).
  - `name` (label for dashboard display).
  - `scopes` (e.g., `read:candidates`, `write:candidates`, `read:jobs`, `ai:recommendations`).
  - `status` (active/revoked).
- API keys are:
  - Created by **org admins only** via a company dashboard UI.
  - Shown once in plaintext to the admin, then stored only as a hash.

### 3.2 Request Authentication

- All external API requests:
  - Use `Authorization: Bearer <api_key>` or `x-api-key: <api_key>`.
  - Next.js API layer:
    - Validates the key against `apiKeys` (hash comparison).
    - Resolves the **organization context** and scopes.
    - Rejects unauthorized or revoked keys with 401/403.

### 3.3 Tenancy Enforcement

- Every API handler:
  - Resolves `organizationId` from the API key.
  - Passes it down to Convex functions.
  - Convex functions:
    - Ensure all data access is scoped to that organization.
    - Prevent cross-tenant leakage (no global candidate/job access).

---

## 4. API Surface Design (Manatal-Like)

### 4.1 Core Resources

Plan for a versioned REST surface, e.g., `/api/v1/...`:

- `GET /api/v1/candidates`
- `POST /api/v1/candidates`
- `GET /api/v1/candidates/{id}`
- `PATCH /api/v1/candidates/{id}`

- `GET /api/v1/jobs`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs/{id}`
- `PATCH /api/v1/jobs/{id}`

- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `PATCH /api/v1/applications/{id}`

Other helpful endpoints:
- `GET /api/v1/taxonomies` (skills, locations, job types, etc.).
- `GET /api/v1/webhooks` / `POST /api/v1/webhooks` for external integrations (future).

### 4.2 Embedded AI Capabilities

AI is not a separate top-level “/ai” namespace; instead:

- **Candidates (Parsing & Enrichment)**
  - `POST /api/v1/candidates` payload can include a `resume` (file or URL).
  - Server-side:
    - Extract text from resume.
    - Call AI model to parse and enrich candidate data (experience, skills, locations, seniority).
    - Store parsed structure + enrichment fields on the candidate record in Convex.

- **Jobs (Enrichment & Matching Signals)**
  - `POST /api/v1/jobs` body can be plain text description; server:
    - Parses description via AI to produce:
      - Inferred skills.
      - Seniority level.
      - Tags for search.
    - Stores these fields alongside existing job data.

- **Recommendations (Ranking)**
  - `GET /api/v1/jobs/{jobId}/candidates`:
    - Returns candidates ranked by AI-derived match score, based on job description and candidate profile/resume.
  - `GET /api/v1/candidates/{candidateId}/jobs`:
    - Returns recommended jobs ranked by match score.

- **Advanced/Semantic Search**
  - `GET /api/v1/candidates?search=...` and `GET /api/v1/jobs?search=...` use:
    - AI embeddings and/or Convex search indexes to compute relevance scores.
    - Response includes `relevance_score` per item.

---

## 5. AI Feature Implementation Strategy

### 5.1 Parsing & Enrichment Pipeline

- **Flow**
  1. Upload candidate resume via API or internal UI.
  2. Store raw file in Convex storage.
  3. Background Convex action:
     - Extract text content.
     - Call AI provider (e.g., OpenAI, Anthropic) with a structured parsing prompt.
     - Normalize response into a well-typed Convex schema (experience entries, skills, education, links).
     - Update candidate record with parsed data + enrichment (e.g., social profile hints).

- **Design considerations**
  - Asynchronous by default; initial create returns candidate ID + pending parsing status.
  - Endpoint to check parsing status: `GET /api/v1/candidates/{id}` (includes `parsing_status` and `parsed_at`).

### 5.2 Recommendations & Ranking

- Use a hybrid strategy:
  - **Phase 1**: Rule-based + AI scoring on demand.
  - **Phase 2**: Precompute embeddings for candidates and jobs and store in Convex.

- **Phase 1 Implementation**
  - When `GET /api/v1/jobs/{jobId}/candidates` is called:
    - Fetch relevant candidates by filters (location, skills overlap) via Convex.
    - Call AI provider with a prompt summarizing job + top N candidates to get ranking scores.
    - Return ranked list with `match_score` and optional `explanation`.

- **Phase 2 Implementation**
  - Maintain embeddings fields on candidates and jobs.
  - Use vector similarity (via external vector DB or AI provider) to rank without per-request expensive calls.

### 5.3 Semantic Search

- For `search` parameters:
  - Convert query to an embedding or call semantic search endpoint at provider.
  - Combine AI ranking with Convex filters and indexes.
  - Always respect organization scoping and plan-based feature gating.

---

## 6. Plan & Feature Gating (Enterprise-Style)

- Tie **API access** and **AI features** to:
  - Organization plan (Free, Starter, Growth, Enterprise).
  - Feature flags stored in Clerk Billing / entitlements and mirrored (only if needed) as a simple capability map at the API layer.

**Example**
- Free:
  - Read-only basic candidate/job endpoints.
  - No AI parsing or recommendations.
- Starter:
  - Limited API rate.
  - Resume parsing and basic enrichment.
- Growth:
  - Higher rate limits.
  - AI recommendations + semantic search.
- Enterprise:
  - Full API surface, webhooks, and custom integration support.

API handlers must:
- Inspect entitlements for the organization behind the API key.
- Reject calls to AI-heavy paths when the plan does not support them.

---

## 7. Phased Delivery Plan

### Phase 1 – Foundation (API + Auth + Tenancy)

- Implement `/api/v1` Next.js route handlers:
  - `GET/POST/PATCH` for candidates and jobs (CRUD without AI).
  - Authentication via API keys + org scoping.
- Add Convex `apiKeys` table and admin-only UI for key management.
- Add minimal rate limiting (per key/org) at the API layer.

### Phase 2 – Parsing & Enrichment

- Add resume upload support to candidate creation via API.
- Implement background Convex actions for resume parsing and profile enrichment.
- Extend candidate schema with parsed fields and tracking metadata.
- Document usage patterns and status fields in API docs.

### Phase 3 – Recommendations & Semantic Search

- Implement AI-backed ranking for:
  - `GET /api/v1/jobs/{jobId}/candidates`.
  - `GET /api/v1/candidates/{candidateId}/jobs`.
- Implement semantic search enhancements on list endpoints with relevance scores.
- Introduce higher-tier gating for AI features and adjust pricing/plan docs.

### Phase 4 – Integrations & MCP/LLM Orchestration

- Expose integration endpoints and webhooks for third parties (e.g., sourcing tools).
- Optionally introduce an **MCP-style server** that:
  - Connects Jobly’s API to external LLMs for workflow automation (pipeline summaries, bulk triage).
- Ensure that any LLM-level automation:
  - Operates on top of the API with same tenancy and permission checks.

---

## 8. Documentation & Developer Experience

- Create `docs/plan` + `docs/api` hierarchy:
  - High-level overview (this file).
  - Detailed endpoint reference (`candidates`, `jobs`, `applications`).
  - Authentication & API key management.
  - AI behavior and limits per plan.
- Provide Postman collection or OpenAPI spec for `/api/v1`.
- Include examples mirroring Manatal-style workflows:
  - Importing candidates from an external tool.
  - Getting ranked candidates for a job.
  - Running semantic search on the candidate pool.

