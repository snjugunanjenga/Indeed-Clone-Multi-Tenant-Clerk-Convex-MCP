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

- **Objectives**
  - Provide a smooth, real‑time hiring experience for both sides of the marketplace.
  - Offer a production‑grade reference for Next.js 16 + Convex + Clerk multi‑tenant architecture.
  - Enable monetization via organization‑level plans and value‑added features.

- **Key Metrics (candidate side)**
  - Time to first job application after sign‑up.
  - Number of saved jobs per active user.
  - Application completion rate per user.

- **Key Metrics (employer side)**
  - Number of active job listings per organization.
  - Time to first candidate review after posting.
  - Conversion from free → paid plans (Starter/Growth or future tiers).

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

