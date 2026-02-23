## Pitch Deck – Jobly (Manatal-Style API + AI Recruitment Platform)

This document is a narrative-style pitch deck outlining the vision, product, and technical strategy behind Jobly.

---

## 1. Problem

Modern hiring is broken for both sides:

- **Candidates** face fragmented job boards, confusing application flows, and little feedback.
- **Recruiters and hiring teams** are stuck stitching together:
  - Legacy ATS tools.
  - Ad-hoc spreadsheets and email chains.
  - Manual screening of hundreds of resumes with little help from AI.

Enterprise-grade platforms like Manatal exist, but:

- Are often **too heavy or expensive** for smaller teams and niche markets.
- Provide **limited flexibility** for product builders who want to embed recruitment flows into their own SaaS products.

We need a platform that is:

- A **first-class job marketplace**.
- A **developer-friendly recruitment API**.
- **AI-native** from day one.

---

## 2. Solution – Jobly

Jobly is a **full-stack, real-time job marketplace** and **Manatal-style Open API** built on:

- **Next.js 16** (App Router) for a modern, responsive web app.
- **Convex** for real-time database, business logic, and storage.
- **Clerk** for authentication, organizations, and billing.
- **Gemini API** for AI parsing, enrichment, recommendations, and semantic search.
- **Gemini Agent SDK or LangChain** for orchestration and agentic workflows.

Two core experiences:

- **Candidates**
  - Build rich profiles and manage resumes.
  - Discover and save jobs with advanced search and filters.
  - Apply and track applications in real time.
- **Employers / Recruiters**
  - Multi-tenant company workspaces with role-based access.
  - Create and manage job postings.
  - Review candidates in a structured, AI-assisted workflow.
  - See plan-based limits, usage, and billing powered by Clerk.

On top of this, Jobly offers a **REST API** that looks and feels like Manatal’s:

- `/api/v1/candidates`, `/api/v1/jobs`, `/api/v1/applications`, `/api/v1/organizations`, `/api/v1/matches`, `/api/v1/taxonomies`, `/api/v1/webhooks`.
- `/api/v1/career/{orgSlug}/jobs` for public career pages and embedded job widgets.

---

## 3. Why Now

- **AI hiring is moving from hype to utility**:
  - Resume parsing, enrichment, and matching are now reliable enough to save real recruiter time.
  - Tools like Gemini offer high-quality language understanding and code-friendly APIs.
- **Developer ecosystems expect APIs, not monoliths**:
  - Companies want to integrate recruitment capabilities into their existing products, not switch entire stacks.
- **Modern infra (Vercel + Convex + Clerk)** makes:
  - Multi-tenancy.
  - Real-time UX.
  - SaaS billing and role-based access.
  - Much easier to build and maintain.

Jobly plugs into this moment as a **reference architecture + platform** for building recruitment flows quickly and correctly.

---

## 4. Product Overview

### 4.1 Candidate Experience

- Rich profiles (experience, education, certifications, skills, links).
- Resume uploads (Convex storage) with Gemini-backed parsing.
- Job search:
  - Keyword + filters (location, type, salary, tags).
  - AI-powered relevance ranking and recommendations.
- Application tracking with real-time statuses and notifications.

### 4.2 Employer / Recruiter Experience

- Multi-tenant workspaces via Clerk Organizations.
- Role-based access:
  - Admin, recruiter, member with finely scoped permissions.
- Job posting:
  - Structured fields and rich text descriptions.
  - AI-assisted tag and skills extraction via Gemini.
- Applicant review:
  - Unified view of candidate profiles, resumes, and application history.
  - Advanced filters (skills, experience) and AI recommendations for best matches.
- Billing and limits:
  - Plans (Free, Starter, Growth, Enterprise) with seat and job caps.
  - Feature gating for AI and API access.

### 4.3 Open API (Manatal-Style)

For integrators and product teams:

- CRUD on candidates, jobs, applications, and matches.
- Attach notes, activities, and files to core objects.
- Taxonomies for languages, industries, match stages, and pipelines.
- Career page endpoints for public job listings and applications.
- Webhooks for event-driven integrations.

---

## 5. AI Strategy – Gemini + Orchestration

Jobly is built with **Gemini at the core** of its intelligence layer:

- **Parsing & Enrichment**
  - Resume uploads are parsed by Gemini into structured experience, education, skills, and seniority.
  - Job descriptions are enriched with inferred tags and skills.
  - Orchestration via **Gemini Agent SDK** or **LangChain** ensures:
    - Consistent prompts and model usage.
    - Composable chains for parsing, scoring, and summarization.
- **Recommendations & Matching**
  - AI scores candidate↔job fit, used to rank:
    - `/api/v1/jobs/{jobId}/candidates`
    - `/api/v1/candidates/{candidateId}/jobs`
  - Outputs:
    - Match scores.
    - Optional explanations to help recruiters understand why a candidate is a fit.
- **Semantic Search**
  - Text queries across candidates and jobs use embeddings and semantic ranking.
  - Results include `relevance_score` for downstream tooling.

The AI layer is:

- **Plan-gated**: heavy features reserved for higher tiers.
- **Server-side only**: no client-side exposure of API keys.
- **Observable**: metrics on latency, cost, and failure rates.

---

## 6. Technical Architecture (At a Glance)

- **Frontend**: Next.js 16 App Router on Vercel.
- **Backend**: Convex functions (queries, mutations, actions) for data and workflows.
- **Auth & Billing**: Clerk for:
  - Authentication, organization management, roles/permissions.
  - Organization-level billing and feature entitlements.
- **Database**: Convex tables for:
  - Users, profiles, resumes, experiences, education, certifications.
  - Companies, company members.
  - Job listings, applications, favorites, notifications.
  - Future: matches, notes, activities, attachments, taxonomies.
- **AI**:
  - Gemini for model calls.
  - Gemini Agent SDK or LangChain for orchestration.
- **Deployment**:
  - Frontend on Vercel.
  - Convex deployed via `npx convex deploy`.
  - Production Clerk keys and webhooks synced to Convex.

See:

- `docs/Project/architecture-manatal-api.md`
- `docs/plan/manatal-style-api-scaling.md`
- `docs/Project/deployment.md`

for deeper technical details.

---

## 7. Business Model & Differentiation

### 7.1 Revenue Model

- **SaaS subscriptions per organization**
  - Free: limited seats and jobs, no AI.
  - Starter: more seats, jobs, and basic AI parsing.
  - Growth / Enterprise: full API access, AI recommendations, semantic search, webhooks, and priority support.
- **Add-ons**
  - Featured jobs and premium placement.
  - Premium candidate profiles and advanced analytics.
  - API usage tiers for high-volume integrations.

### 7.2 Differentiation

- **Developer-first**: Manatal-style API with modern tooling (Next.js, Convex, Clerk, Gemini).
- **AI-native**: AI is embedded into the core data model and workflows, not bolted on.
- **Multi-tenant by design**: Built on Clerk Organizations and Convex from day one.
- **Reference architecture**: Serves as a blueprint for teams building niche job boards or recruitment features into their products.

---

## 8. Roadmap Snapshot

Short term (0–6 months):

- Harden core marketplace features.
- Introduce `/api/v1` for jobs and candidates.
- Add basic resume parsing and enrichment via Gemini.

Medium term (6–12 months):

- Expand API surface to matches, notes, activities, attachments, and taxonomies.
- Launch career page APIs and webhook system.
- Add AI-powered matching and semantic search in production.

Long term (12–24 months):

- Mature integration ecosystem (ATS/CRM connectors, sourcing tools).
- Enterprise features (auditing, custom workflows, regional payment methods).
- Advanced AI agents for recruiter Copilot scenarios (pipeline summarization, prioritized next actions).

