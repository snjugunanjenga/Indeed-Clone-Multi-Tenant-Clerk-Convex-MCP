## Pricing & Plans – Jobly

This document defines the subscription model for Jobly, including limits, features, and how each tier maps to API and AI capabilities.

All plans are **organization-based** (Clerk Organizations) and are intended to be implemented via **Clerk Billing**.

> The exact prices below are placeholders and can be adjusted before launch.

---

## 1. Plan Overview

| Plan        | Monthly Price (suggested) | Seats Included | Active Jobs | API Access                 | AI Features                                |
|------------|---------------------------|----------------|-------------|----------------------------|-------------------------------------------|
| Free       | $0                        | 1              | 1           | Internal only, low volume  | None                                      |
| Starter    | $49                       | 3              | 5           | Standard `/api/v1` CRUD    | Resume parsing & basic enrichment         |
| Growth     | $149                      | 10             | 25          | Full `/api/v1` + webhooks  | Parsing, enrichment, recommendations, search |
| Enterprise | Custom                    | 10+ (custom)   | 25+ (custom)| Full API + custom SLAs     | All AI features + custom workflows        |

---

## 2. Free Plan

**Target:** Solo founders, very small teams, and early testers.

- **Price:** $0 / month
- **Seats:** 1
- **Active Job Listings:** 1
- **Features:**
  - Basic company workspace via Clerk Organization.
  - Create and manage up to 1 active job at a time.
  - View and manage applications for that job.
  - Candidate portal (profiles, resumes, applications, favorites).
- **API:**
  - Limited, internal-usage-only API (for Jobly UI).
  - No external API keys.
- **AI:**
  - No Gemini-powered features exposed.

Intended to be a **frictionless entry point** with a clear upgrade path once teams need more seats or jobs.

---

## 3. Starter Plan

**Target:** Small hiring teams and agencies testing deeper integration.

- **Price:** $49 / month (suggested)
- **Seats:** 3
- **Active Job Listings:** 5
- **Features (in addition to Free):**
  - Team collaboration with Admin + Recruiter + Member roles.
  - Basic analytics (views, applications per job).
- **API:**
  - Access to core `/api/v1` endpoints:
    - `GET/POST/PATCH /api/v1/jobs`
    - `GET/POST/PATCH /api/v1/candidates`
    - Limited sub-resources (education, experience, resumes).
  - Rate limits suitable for light integrations (e.g. small internal tools).
  - Org-scoped API keys with scopes like `read:candidates`, `write:jobs`.
- **AI (Gemini):**
  - **Resume parsing & basic enrichment**:
    - Extract skills, experience, and education for candidates.
  - No AI recommendations or semantic search yet.

Starter is where organizations **start integrating** Jobly data into their own tools and workflows with modest AI assistance.

---

## 4. Growth Plan

**Target:** Growing teams, specialist agencies, and SaaS products embedding recruitment.

- **Price:** $149 / month (suggested)
- **Seats:** 10
- **Active Job Listings:** 25
- **Features (in addition to Starter):**
  - Advanced candidate filters (skills, years of experience).
  - Enhanced analytics (funnel metrics, time-to-hire).
  - Priority support.
- **API:**
  - Full CRUD access on:
    - `candidates`, `jobs`, `applications`, `organizations` (where applicable).
    - Sub-resources: educations, experiences, attachments, notes, social-media.
  - Career page APIs:
    - `/api/v1/career/{orgSlug}/jobs`
    - `/api/v1/career/{orgSlug}/jobs/{jobId}`
    - `/api/v1/career/{orgSlug}/jobs/{jobId}/application-form`
    - `/api/v1/career/{orgSlug}/jobs/{jobId}/apply`
  - Webhooks management:
    - `/api/v1/webhooks` for registering and managing outbound integrations.
  - Higher rate limits suitable for production integrations.
- **AI (Gemini + Agent SDK / LangChain):**
  - Resume and job parsing + enrichment.
  - AI-powered **recommendations**:
    - Ranked candidates per job.
    - Recommended jobs per candidate.
  - **Semantic search** with relevance scores across candidates and jobs.

Growth is the first tier that unlocks a **Manatal-style Open API + AI** for serious integrations.

---

## 5. Enterprise Plan

**Target:** Larger organizations, enterprise agencies, and SaaS platforms that need custom workflows.

- **Price:** Custom (contract-based)
- **Seats:** 10+ (configurable)
- **Active Job Listings:** 25+ (configurable)
- **Features (in addition to Growth):**
  - Custom seat and job limits.
  - Dedicated onboarding and support.
  - Advanced analytics and reporting.
  - Optional SSO and compliance add-ons (e.g., SOC2 readiness flows).
- **API:**
  - Full access to all `/api/v1` endpoints, including:
    - Matches, taxonomies, and admin-level operations.
  - Higher, negotiable rate limits and burst allowances.
  - Custom webhooks and event schemas as needed.
  - Potential dedicated API subdomain.
- **AI:**
  - All Gemini-powered features from Growth.
  - Custom workflows via Gemini Agent SDK or LangChain:
    - Recruiter Copilot experiences (pipeline summaries, prioritized actions).
    - Fine-tuned prompts and tooling for specific verticals.

Enterprise is tailored for teams that need **deep integration and customization** on top of Jobly’s platform.

---

## 6. Mapping Plans to Entitlements

Implementation will use **Clerk Billing** with:

- Organization plans: `free`, `starter`, `growth`, `enterprise`.
- Feature keys and permissions, for example:

| Feature Key           | Free | Starter | Growth | Enterprise |
|-----------------------|------|---------|--------|------------|
| `job_posting`         | ✅   | ✅      | ✅     | ✅         |
| `applicant_review`    | ✅   | ✅      | ✅     | ✅         |
| `team_management`     | ❌   | ✅      | ✅     | ✅         |
| `advanced_filters`    | ❌   | ❌      | ✅     | ✅         |
| `analytics`           | ❌   | Basic   | ✅     | ✅ (extra) |
| `api_access`          | ❌   | Basic   | Full   | Full+      |
| `ai_parsing`          | ❌   | ✅      | ✅     | ✅         |
| `ai_recommendations`  | ❌   | ❌      | ✅     | ✅         |
| `ai_semantic_search`  | ❌   | ❌      | ✅     | ✅         |
| `webhooks`            | ❌   | ❌      | ✅     | ✅         |

Server-side code (Next.js API handlers and Convex functions) will:

- Use **Clerk’s `has()` checks** to validate active plan and features.
- Enforce limits:
  - Seats (member count per org).
  - Active jobs.
  - API rate and AI usage quotas.

---

## 7. Future Extensions

Potential add-ons and experiments:

- **Pay-per-use AI add-ons**:
  - Additional Gemini credit bundles for high-volume parsing or matching.
- **Per-seat pricing** beyond included seats.
- **Data exports & advanced reporting**:
  - Additional fees for scheduled exports or BI integrations.

These extensions should build on the plan structure defined here, without breaking existing entitlements for current customers.

