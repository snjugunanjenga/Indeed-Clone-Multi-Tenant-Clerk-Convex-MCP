## Architecture – Manatal-Style API Evolution for Jobly

This document captures the target architecture for evolving Jobly into a **Manatal-style recruitment platform**: a multi-tenant job marketplace with a rich REST API, embedded AI capabilities, and strong support for recruiter integrations.

---

## 1. High-Level Architecture

```mermaid
flowchart LR
  subgraph External Clients
    Recruiter[Recruiter apps\n& integration servers]
    CareerSite[Career pages\n(frontend)]
    InternalUI[Jobly Web App\n(Next.js)]
  end

  subgraph API Layer [/Next.js API Layer/]
    RestAPI[/REST API\n/api/v1/.../]
    CareerAPI[/Career API\n/api/v1/career/.../]
  end

  subgraph Backend [Jobly Backend]
    Convex[Convex Functions\nqueries/mutations/actions]
    DB[(Convex Tables\nusers, profiles, jobs,\napplications, matches, notes,\nattachments, taxonomies)]
    Storage[(Convex Storage\nresumes, attachments)]
  end

  subgraph IdentityBilling [Identity & Billing]
    Clerk[Clerk\nAuth + Orgs + Billing]
  end

  subgraph AIProviders [AI Providers]
    LLM[LLM APIs\n(OpenAI/Anthropic/...)]
    Vector[Embedding/Similarity\n(optional vector store)]
  end

  Recruiter -->|"HTTPS + API Key"| RestAPI
  CareerSite -->|"Public HTTPS"| CareerAPI
  InternalUI -->|"convex/react\nhooks"| Convex

  RestAPI -->|"org-scoped\nRPC/HTTP calls"| Convex
  CareerAPI --> Convex

  Convex --> DB
  Convex --> Storage

  RestAPI -->|"server-side\nAI calls"| LLM
  Convex -->|"context data"| RestAPI
  LLM -->|"parsed/enriched data,\nrankings, scores"| RestAPI
  RestAPI --> Convex
  RestAPI --> Vector
  Vector --> RestAPI

  Clerk --> RestAPI
  Clerk --> Convex
```

**Key ideas**

- External clients (recruiter systems, low-code tools, job boards) integrate with Jobly through a **versioned `/api/v1` REST API**.
- The **Jobly Web App** continues to use Convex directly via the generated client and React hooks.
- The API layer is responsible for:
  - **API key authentication** and org scoping.
  - **Rate limiting**, pagination, error formatting, and file upload handling.
  - **Plan/feature gating** based on Clerk entitlements.
  - Invoking AI providers for parsing, enrichment, recommendations, and semantic search.
- Convex remains the **system of record** for all domain data and workflows.
- Clerk remains the **source of truth for identity, organizations, roles, and billing**.

---

## 2. Main Components & Responsibilities

### 2.1 Next.js API Layer

**Responsibilities**

- Expose **REST endpoints** under `/api/v1`:
  - Core resources:
    - `candidates`, `jobs`, `applications`, `organizations`, `matches`, `taxonomies`.
  - Sub-resources mirroring Manatal:
    - Candidate educations, experiences, attachments, notes, social media, nationalities.
    - Job attachments, notes, matches.
- Expose **Career API** endpoints under `/api/v1/career/{orgSlug}`:
  - List public job posts.
  - Fetch job detail and dynamic application form.
  - Submit job applications and referrals.
- Handle **cross-cutting concerns**:
  - API key validation (resolve org + scopes).
  - Plan and feature entitlements (based on Clerk Billing).
  - Rate limiting and pagination.
  - Normalized error responses and validation.
  - File uploads (resumes, attachments) before handing off to Convex storage.
- Call Convex functions for all data access and business logic.
- Call AI providers for:
  - Resume and job description parsing.
  - Recommendations and match scoring.
  - Semantic search and relevance ranking.

### 2.2 Convex Backend

**Data model (high level)**

- **Core tables**
  - `users`, `profiles`, `experiences`, `education`, `certifications`, `resumes`.
  - `companies` (Clerk organizations), `companyMembers`.
  - `jobListings`.
  - `applications`.
  - `matches` (optional, for long-lived candidate↔job relationships beyond applications).
- **Supporting tables**
  - `notes` (candidate- and job-level).
  - `activities` (tracked events and interactions).
  - `attachments` (files linked to candidates, jobs, or matches).
  - `notifications`.
  - `taxonomies`: `languages`, `industries`, `currencies`, `nationalities`, `matchStages`, `jobPipelines`.
  - `apiKeys` (org-scoped API credentials with scopes).
  - `webhooks` (external endpoints to receive events).

**Responsibilities**

- Implement **domain logic** for:
  - CRUD and search on candidates and jobs.
  - Application lifecycle and optional matches abstraction.
  - Profile and resume management (including storage).
  - Company context, plan and seat limits, job limits, usage metrics.
  - Favorites, notifications, and other UX features.
- Enforce **tenant isolation**:
  - All access is scoped to the current organization/company where applicable.
- Provide **internal APIs** consumed by the Next.js API layer and the Jobly web app.
- Receive and process **Clerk webhooks** to sync users, orgs, and memberships.

### 2.3 Clerk (Identity & Billing)

**Responsibilities**

- User authentication and session management.
- Organization (company workspace) management and membership roles.
- Billing and subscription plans:
  - Free, Starter, Growth, Enterprise tiers.
  - Feature entitlements used to gate:
    - API access and rate limits.
    - AI features (parsing, recommendations, semantic search).
    - Webhooks and high-volume operations.
- Webhooks into Convex to keep the app database in sync with identity and org state.

### 2.4 AI Providers

**Responsibilities**

- **Parsing & enrichment**
  - Convert raw resume and job description text into structured entities:
    - Skills, experience, education, seniority, locations, inferred roles.
  - Returned data is normalized and stored in Convex.
- **Recommendations & scoring**
  - Power endpoints like:
    - `GET /api/v1/jobs/{jobId}/candidates` → ranked candidate list.
    - `GET /api/v1/candidates/{candidateId}/jobs` → ranked job list.
- **Semantic search**
  - Convert search queries into embeddings or use semantic ranking.
  - Provide `relevance_score` and optional explanations for list endpoints.

All AI calls are done **server-side** via the Next.js API layer and are:

- Rate limited and feature-gated by plan.
- Designed to degrade gracefully (fall back to non-AI search and filters if unavailable).

---

## 3. Webhooks & Integration Architecture

```mermaid
flowchart LR
  subgraph Jobly
    RestAPI[/REST API\n/api/v1/.../]
    Convex[Convex Backend]
    WebhookMgr[(Webhooks table\nconfig & secrets)]
  end

  subgraph Integrations
    Partner[Partner systems\n(HR tools, sourcing,\nanalytics platforms)]
  end

  RestAPI <-->|create/list/update/delete\nwebhook configs| WebhookMgr
  Convex -->|"emit domain events\n(candidate/job/match changes)"| RestAPI
  RestAPI -->|"POST JSON payloads"| Partner
```

**Flow**

- Partners register webhooks via `/api/v1/webhooks` endpoints (authorized by API key + scopes).
- Convex emits domain events (candidate created/updated, job created/updated/closed, match or application stage changes) into an internal event bus or directly to the API layer.
- The API layer:
  - Looks up matching webhook configurations in `webhooks`.
  - Delivers signed HTTP POST requests to partner endpoints with standardized event payloads.
  - Respects retry and backoff policies; surfaces failures to org admins.

---

## 4. Relation to Existing Docs

- **`docs/Project/project-overview.md`** – describes the current state of Jobly (Next.js + Convex + Clerk app).
- **`docs/Project/prd.md`** – defines product requirements and includes a “Manatal‑Style API & Scaling Requirements” section that this architecture satisfies.
- **`docs/plan/manatal-style-api-scaling.md`** – provides a phased implementation plan for this architecture.
- **`docs/Project/api-endpoints.md`** – documents the current Convex-powered API surface; will be extended as `/api/v1` endpoints are implemented.

This file serves as the **source of truth for the target architecture** of the Manatal-style API evolution, tying together the PRD, feature set, and scaling plan.

