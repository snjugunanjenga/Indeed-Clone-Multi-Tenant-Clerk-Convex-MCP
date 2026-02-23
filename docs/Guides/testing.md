## Testing Guide – Jobly

This document defines how we test Jobly today, and how we will expand coverage as the Manatal-style API surface and Gemini-powered features are implemented.

---

## 1. Testing Strategy

- **Unit tests**: Pure functions, Convex domain logic (where practical via mocked context), and utility modules in `lib/`.
- **Integration tests**:
  - API-like flows hitting Convex functions via the generated client (in Node test environment).
  - Next.js route handlers under `/api/v1` once implemented.
- **End-to-end (E2E)** tests (future):
  - Browser-based tests to cover critical candidate and employer journeys (sign-in, create org, post job, apply, review applications).

Recommended tooling:

- **Vitest** or **Jest** for unit/integration tests (Vitest integrates nicely with Vite-like setups; Jest is more widely known).
- **Playwright** or **Cypress** for E2E tests.

> At the time of writing, the repo does not yet have a configured test runner; this guide documents the intended direction so we can introduce tests in a consistent way.

---

## 2. What to Test First

### 2.1 Critical Flows

- **Auth & org flows**
  - User can sign in/sign up (Clerk).
  - User with no org can create an organization and access `/company/*`.
- **Candidate flows**
  - Build profile (basic fields, skills, resumes).
  - Search jobs, view job details.
  - Apply to a job, see status in “My applications”.
  - Withdraw an application (when allowed).
- **Employer flows**
  - Post a job (happy path, validation errors).
  - View applications, change statuses (submitted → in_review → accepted/rejected).
  - Auto-close job when `autoCloseOnAccept` is enabled.
  - Receive notifications for application events.

### 2.2 Convex Domain Logic

- `convex/jobs.ts`
  - `createJobListing`:
    - Plan-based job limit enforcement.
    - Salary validation.
  - `searchJobListings`:
    - Search index integration and filters (location, type, tags).
- `convex/applications.ts`
  - `applyToJob`: profile completeness, duplicate applications, resume ownership.
  - `updateApplicationStatus`: auto-close and notification behavior.
- `convex/profiles.ts`
  - Profile CRUD and resume limits.

---

## 3. Example Test Layout

Suggested structure:

```txt
.
└── tests
    ├── unit
    │   ├── lib
    │   │   └── utils.test.ts
    │   └── convex
    │       ├── jobs.test.ts
    │       └── applications.test.ts
    ├── integration
    │   └── api-v1
    │       ├── candidates.test.ts
    │       └── jobs.test.ts
    └── e2e
        └── basic-flows.spec.ts
```

In `package.json`, we will eventually add:

```jsonc
{
  "scripts": {
    "test": "vitest", // or "jest"
    "test:watch": "vitest --watch",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration"
  }
}
```

---

## 4. Testing Gemini & Orchestration

Gemini is used for:

- Resume and job description parsing.
- Profile and job enrichment (skills, seniority, tags).
- Recommendations and semantic search (match scores, relevance).

Testing strategy:

- **Unit tests with mocks**
  - Wrap Gemini calls in a dedicated module (e.g. `lib/ai/gemini.ts`).
  - In tests, mock this module to return deterministic responses.
  - Verify that Convex actions and Next.js API handlers:
    - Call the wrapper with the right inputs.
    - Correctly transform and persist returned data.
- **Integration tests with a “fake” Gemini**
  - Optional: create a lightweight in-memory fake that simulates Gemini responses.
  - Use it when testing LangChain or Gemini Agent SDK orchestration logic.
- **No real-API calls in CI**
  - CI pipelines should not depend on live Gemini traffic.
  - If you run “live” sanity checks, mark them as opt-in and keep them off by default.

---

## 5. Running Tests Locally

Once Vitest/Jest is configured:

```bash
pnpm test         # run all tests
pnpm test:unit    # run unit tests
pnpm test:integration
```

For E2E (e.g. Playwright):

```bash
pnpm test:e2e
```

These will be integrated into **GitHub Actions** as part of the CI pipeline (see `docs/Project/deployment.md` for CI/CD notes).

---

## 6. Coverage & Quality Gates

Suggested initial targets:

- 70%+ coverage for:
  - `convex/jobs.ts`
  - `convex/applications.ts`
  - `convex/profiles.ts` (profile + resume handling)
- 60%+ coverage for Next.js route handlers under `/api/v1`.

As the Manatal-style API and Gemini features mature, raise coverage targets and add:

- Contract tests for `/api/v1` endpoints (request/response schemas).
- Backwards-compatibility checks when changing response shapes.

