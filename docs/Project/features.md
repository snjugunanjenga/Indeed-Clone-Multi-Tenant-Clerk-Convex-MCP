## Feature Overview – Jobly

### 1. Candidate Features

- **Account & Profile**
  - Clerk‑based sign‑up and sign‑in.
  - Profile builder with:
    - Experience, education, certifications.
    - Skills and social links (LinkedIn, GitHub, website).
  - Resume management:
    - Upload multiple resumes (Convex storage).
    - Set default resume.

- **Job Discovery & Search**
  - Job listing index with:
    - Text search across title, description, company, location, and tags.
    - Filters for location, workplace type (remote, hybrid, on‑site), employment type, salary range, and tags.
  - Debounced search input to avoid unnecessary queries.
  - Saved jobs / favorites list.

- **Applications & Tracking**
  - One‑click apply using selected resume and optional cover letter.
  - Application status tracking:
    - States: Submitted → In Review → Accepted / Rejected / Withdrawn.
  - Real‑time updates as employers change status.

- **Notifications**
  - In‑app notifications for:
    - Application status changes.
    - Job closed or updated events.
    - Other key lifecycle events.
  - Notification bell in the UI.

### 2. Employer / Company Features

- **Workspaces & Roles**
  - Company workspaces backed by Clerk Organizations.
  - Role‑based access:
    - Admin: full control + billing.
    - Recruiter: job management + hiring decisions.
    - Member: read‑only access.
  - Invite members via email/invite flows.

- **Job Management**
  - Create, edit, and close job listings.
  - Rich text editor for job descriptions (Tiptap).
  - Configurable fields:
    - Workplace type, employment type, salary ranges, tags, and auto‑close options.

- **Applicant Review & Pipeline**
  - View candidate profiles, resumes, and cover letters per job.
  - Move candidates through pipeline stages with instant feedback to the candidate.
  - Optionally auto‑close a job when a candidate is accepted.

- **Billing & Plan Limits**
  - Pricing tiers (Free / Starter / Growth) managed via Clerk Billing.
  - Plan‑based constraints (from README and Convex schema):
    - Seats per organization.
    - Maximum number of active job listings.
    - Advanced filter access on higher tiers.
  - Company billing page and usage overview components.

### 3. Cross‑Cutting & Technical Features

- **Real‑Time Experience**
  - Convex reactive queries keep job lists, applications, and notifications up to date without manual refresh.

- **Multi‑Tenancy**
  - Tenancy is enforced through Clerk Organizations and Convex access patterns.
  - Users can belong to multiple organizations and switch between them.

- **UI / UX**
  - Responsive layouts:
    - Mobile‑optimized navigation (bottom nav).
    - Desktop sidebars for candidate and employer flows.
  - Shared component library:
    - shadcn/ui components under `components/ui`.
    - Shared primitives like `notification-bell`, `site-logo`, `rich-text-editor`, `rich-text-display`.

### 4. Future Feature Ideas (from README + roadmap input)

- AI‑assisted candidate/job matching.
- Email notifications and digests.
- Analytics dashboards for employers.
- Featured listings and premium candidate profiles.
- Job alerts and saved search notifications.

