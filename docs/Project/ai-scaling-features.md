## AI Features & Scaling Plan – Jobly

### 1. Current State

The codebase does not currently integrate AI models directly, but the README lists several AI‑driven ideas:
- AI‑powered job recommendations.
- AI cover letter generator.
- Resume parsing and auto‑tagging of job listings.

This document outlines how to introduce these features in a scalable, production‑ready way.

### 2. AI Feature Concepts

1. **AI Job Recommendations (Candidate Side)**
   - Goal: Suggest relevant jobs based on a candidate’s profile, skills, and past interactions.
   - Inputs:
     - Profile attributes (skills, years of experience, locations, open‑to‑work, roles).
     - Application history (jobs applied, accepted, rejected).
     - Favorited jobs.
   - Output:
     - Ranked list of recommended jobs, with explanations (optional).

2. **AI Cover Letter Generator**
   - Goal: Help candidates generate tailored cover letters given:
     - A job description.
     - Candidate profile and resume data.
   - Constraints:
     - Must show the generated text to the user for review/edit; never auto‑submit.
     - Keep prompts free of secrets or internal system details.

3. **Resume Parsing & Auto‑Tagging**
   - Goal: Extract skills, seniority, and role types from resumes and job descriptions to:
     - Improve search indexing.
     - Auto‑populate tags and filters on job listings.
   - Inputs:
     - Resume file content (text extracted server‑side).
     - Job description rich text converted to plain text.

### 3. High‑Level Architecture for AI Integration

```mermaid
flowchart TB
    Browser[Next.js Frontend] -->|"AI actions\n(e.g., server actions)"| NextServer[Next.js Server]
    NextServer -->|"Secure API call\n(API key, rate limits)"| AIProvider[AI Provider\n(e.g., OpenAI, Vertex, Anthropic)]

    Browser -->|"Convex hooks"| Convex[Convex Backend]
    Convex -->|"Profile + Job\ncontext data"| NextServer

    AIProvider -->|"Model outputs"| NextServer -->|"Persist derived\nsignals (optional)"| Convex
```

**Design principles**
- All AI calls go through **server‑side endpoints or server actions**, never from the browser directly.
- Derived data (tags, similarity scores, etc.) is stored in Convex when it provides long‑term value.
- AI functionality is **feature‑gated** by plan tier and rate‑limited.

### 4. Scaling & Performance Considerations

- **Cost control**
  - Rate‑limit AI calls per user and per organization.
  - Cache results where possible (e.g., store recommendations snapshot and refresh periodically).
  - Prefer smaller, cheaper models for bulk tasks (tagging, parsing) and reserve larger models for high‑value flows.

- **Data volume & indices**
  - Use Convex indexes for:
    - Job embeddings metadata (if stored).
    - AI‑generated tags on jobs and profiles.
  - Ensure queries used by recommendation flows remain efficient at scale.

- **Batching & background work**
  - Offload heavy tasks (resume parsing for many users, mass re‑tagging of jobs) to background Convex actions.
  - Schedule re‑computation of derived AI signals instead of doing everything synchronously in the request path.

### 5. AI Feature Gating & Monetization

- **Free tier**
  - Access to core job board features only.

- **Starter tier**
  - Limited AI usage:
    - X AI cover letter generations per month per user.
    - Basic resume parsing and auto‑tags.

- **Growth / Premium tiers**
  - Higher quotas for AI features.
  - Access to AI job recommendations and smarter ranking.
  - Prioritized background processing for organizations on higher tiers.

### 6. Risk & Compliance Considerations

- **Privacy**
  - Avoid storing raw AI prompts and outputs with personally identifiable information unless necessary.
  - Clearly document what data is sent to third‑party AI providers.

- **Bias & Fairness**
  - AI recommendations are advisory; ultimate decisions remain with human employers.
  - Provide a simple way to explain or adjust recommendations (e.g., filters, “more like this”).

- **Fallbacks**
  - All AI features must degrade gracefully:
    - If AI is unavailable, show standard search and filters.
    - If generation fails, display a friendly error and suggest manual input.

