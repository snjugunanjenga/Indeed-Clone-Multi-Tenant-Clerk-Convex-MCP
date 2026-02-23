## Roadmap & Revenue Plan – Jobly

This roadmap assumes the existing implementation as a strong v1 and focuses on testing, monetization, AI features, and scaling.

---

## 1. Revenue Streams (Planned)

- **Freemium SaaS model**
  - Free tier with limited seats and active jobs (already reflected in README).
  - Paid tiers (Starter, Growth, and future Pro/Enterprise) with:
    - Higher seat and job limits.
    - Access to advanced filters and AI‑powered features.

- **Featured listings**
  - Employers can pay to boost visibility for specific job postings.
  - Surfaced via promoted slots in search results and on landing pages.

- **Premium candidate profiles**
  - Candidates can opt into a premium profile tier for:
    - Enhanced visibility to employers.
    - Additional analytics (profile views, interest).

- **API / integration access (future)**
  - Paid API to integrate Jobly data into external ATS/HR tools.

- **Regional payments (e.g., M‑Pesa, local gateways) – future**
  - For markets where card payments are less common, support regional payment providers in higher tiers or specific regional offerings.

---

## 2. 6‑Month Roadmap (Short Term)

**Goals**
- Establish strong engineering foundations (tests, CI/CD).
- Harden multi‑tenancy and security.
- Ship first monetization hooks.

**Key initiatives**
- **Testing & Quality**
  - Introduce Jest/Vitest and write tests for:
    - Jobs, applications, profiles, companies, notifications.
  - Add coverage reporting and `docs/Project/testing.md`.
- **CI/CD**
  - Add GitHub Actions workflow:
    - Run lint + tests on every PR.
    - Optional preview deployments via Vercel.
- **Security & Multi‑Tenancy**
  - Audit Convex functions for org scoping and role checks.
  - Add negative tests for unauthorized access.
- **Billing & Limits**
  - Tighten enforcement of plan limits at the Convex layer.
  - Improve company billing/usage UX (clear indicators and upsell paths).

---

## 3. 12‑Month Roadmap (Medium Term)

**Goals**
- Introduce AI‑powered features.
- Improve analytics and engagement.
- Start experimenting with monetization levers.

**Key initiatives**
- **AI Features (Phase 1)**
  - AI cover letter generator for candidates (gated by plan).
  - Resume parsing + auto‑tagging for job listings.
- **Analytics**
  - Employer dashboards:
    - Job views, application funnel, time‑to‑hire metrics.
  - Basic candidate insights (number of views, application performance).
- **Monetization Experiments**
  - Implement featured listings as a paid add‑on.
  - Add ability to flag jobs/profiles as premium and tune search ranking.
- **Operational**
  - Introduce basic logging and monitoring around AI calls, billing sync, and webhook reliability.

---

## 4. 24‑Month Roadmap (Long Term)

**Goals**
- Mature AI recommendation engine.
- Expand revenue channels and integrations.
- Prepare for higher scale usage and potential regionalization.

**Key initiatives**
- **AI Features (Phase 2)**
  - AI job recommendations with explainable ranking.
  - “Job alerts” for candidates based on saved filters and inferred preferences.
  - Auto‑generated job description templates for employers.
- **Ecosystem & Integrations**
  - Public API for:
    - Pulling job listings into external tools.
    - Sending application events back to company systems.
  - Native integrations with common ATS/HR platforms.
- **Payments & Globalization**
  - Explore local payment methods (e.g., M‑Pesa) in targeted regions.
  - Localized UI and currency support for pricing and billing pages.
- **Scale & Reliability**
  - Performance tuning for large job and user volumes.
  - Advanced rate limiting, abuse detection, and audit logging.

---

## 5. Dependencies & Risks

- **External providers**
  - Clerk, Convex, and AI providers are critical dependencies.
  - Risk mitigation via:
    - Clear fallbacks when providers are unavailable.
    - Isolating provider‑specific logic behind thin abstractions.

- **AI & Compliance**
  - Need to monitor ongoing regulatory and ethical guidance around AI in hiring.
  - Avoid automated decision‑making that could be interpreted as unfair or discriminatory.

---

## 6. Next Steps

Short term (next iterations):
- Decide on test framework (Jest vs Vitest) and wire into `package.json`.
- Add initial tests for existing core flows.
- Define pricing and feature gating rules in one place (config or Convex metadata) and reflect them in UI and documentation.

