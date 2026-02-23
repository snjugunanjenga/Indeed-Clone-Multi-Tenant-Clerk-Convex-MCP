## API Endpoints – Jobly (Current Implementation)

This document describes the **current API surface** exposed by the Jobly app, focusing on Convex functions and HTTP routes that power the candidate and employer experiences. It does **not** yet include the future Manatal-style REST API described in `docs/plan/manatal-style-api-scaling.md`.

---

## 1. HTTP Endpoints (Convex)

### 1.1 Clerk Webhook – User & Organization Sync

- **URL**: `POST /webhooks/clerk`
- **Implementation**: Convex HTTP route in `convex/http.ts`
- **Auth**:
  - Expects **Svix** headers from Clerk:
    - `svix-id`
    - `svix-timestamp`
    - `svix-signature`
  - Verifies signature with `CLERK_WEBHOOK_SIGNING_SECRET`.
- **Purpose**:
  - Syncs Clerk **users**, **organizations**, and **organization memberships** into Convex tables.
- **Handled events**:
  - `user.created`, `user.updated`, `user.deleted`
  - `organization.created`, `organization.updated`, `organization.deleted`
  - `organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted`

On valid events, the handler calls internal Convex mutations like `internal.sync.upsertUserFromWebhook`, `internal.sync.upsertOrganizationFromWebhook`, `internal.sync.upsertOrganizationMembershipFromWebhook`, and their corresponding delete variants.

---

## 2. Convex Functions – Jobs

Defined in `convex/jobs.ts`. All job-related queries and mutations are consumed from the frontend via the generated Convex client (e.g., `api.jobs.createJobListing`, etc.).

### 2.1 `createJobListing` (mutation)

- **Args**:
  - `companyId` (`Id<"companies">`)
  - `title` (`string`)
  - `description` (`string`, rich text HTML)
  - `location` (`string`)
  - `employmentType` (`"full_time" | "part_time" | "contract" | "internship" | "temporary"`)
  - `workplaceType` (`"on_site" | "remote" | "hybrid"`)
  - `salaryMin`, `salaryMax` (`number`)
  - `salaryCurrency` (`string`)
  - `tags?` (`string[]`)
  - `featured?` (`boolean`)
  - `autoCloseOnAccept?` (`boolean`)
- **Behavior**:
  - Ensures the viewer is a valid company member with role `admin` or `recruiter`.
  - Enforces **plan-based job limits** using the company’s plan and `jobLimit` overrides.
  - Validates `salaryMin <= salaryMax`.
  - Normalizes tags and builds a `searchText` field for search index.
  - Inserts a new `jobListings` row marked as `isActive = true`.

### 2.2 `getJobListingById` (query)

- **Args**:
  - `jobId` (`Id<"jobListings">`)
- **Behavior**:
  - Returns a single job listing document by ID (or `null` if not found).

### 2.3 `listRecentJobs` (query)

- **Args**:
  - `limit?` (`number`, default 20, capped at 100)
- **Behavior**:
  - Returns the most recent **active** job listings ordered by `createdAt` descending.

### 2.4 `searchJobListings` (query)

- **Args**:
  - `searchText?` (`string`)
  - `companyId?` (`Id<"companies">`)
  - `location?` (`string`)
  - `workplaceType?` (`"on_site" | "remote" | "hybrid"`)
  - `employmentType?` (`"full_time" | "part_time" | "contract" | "internship" | "temporary"`)
  - `minSalary?` (`number`)
  - `tags?` (`string[]`)
  - `includeClosed?` (`boolean`, default `false`)
  - `limit?` (`number`, default 20, capped at 100)
- **Behavior**:
  - Uses Convex **search index** `search_jobs` on `searchText` when `searchText` is provided.
  - Supports scoping to a single company and filtering by workplace type, employment type, location, salary, and tags.
  - Optionally includes closed jobs when `includeClosed = true`.

### 2.5 `listCompanyJobs` (query)

- **Args**:
  - `companyId` (`Id<"companies">`)
  - `includeClosed?` (`boolean`)
  - `limit?` (`number`, default 50, capped at 200)
- **Behavior**:
  - Requires the viewer to be a member of the company (`admin`, `recruiter`, or `member`).
  - Lists all or only active jobs for a given company, ordered by `createdAt` descending.

### 2.6 `updateJobListing` (mutation)

- **Args**:
  - `companyId` (`Id<"companies">`)
  - `jobId` (`Id<"jobListings">`)
  - Partial fields to update: `title`, `description`, `location`, `employmentType`, `workplaceType`, `salaryMin`, `salaryMax`, `salaryCurrency`, `tags`, `featured`, `autoCloseOnAccept`, `isActive`.
- **Behavior**:
  - Requires company role `admin` or `recruiter`.
  - Validates that the job belongs to the company.
  - Enforces salary min/max constraint when both provided.
  - Recomputes `searchText` and updates `updatedAt`; sets `closedAt` when `isActive` toggles to `false`.

### 2.7 `closeJobListing` (mutation)

- **Args**:
  - `companyId` (`Id<"companies">`)
  - `jobId` (`Id<"jobListings">`)
- **Behavior**:
  - Requires `admin` or `recruiter` role.
  - Marks job as inactive and sets `closedAt` / `updatedAt`.
  - Sends `job_closed` notifications to all candidates with `submitted` or `in_review` applications for that job.

---

## 3. Convex Functions – Applications

Defined in `convex/applications.ts`.

### 3.1 `applyToJob` (mutation)

- **Args**:
  - `jobId` (`Id<"jobListings">`)
  - `coverLetter?` (`string`)
  - `resumeId?` (`Id<"resumes">`)
  - `answers?` (`{ question: string; answer: string }[]`)
- **Behavior**:
  - Ensures the job is active.
  - Requires candidate to have a profile with `firstName` and `lastName`.
  - Validates that the selected resume belongs to the user.
  - Prevents duplicate applications unless the previous one was withdrawn.
  - Inserts or updates the `applications` row and increments `applicationCount` on the job.
  - Sends `application_received` notification to the posting employer.

### 3.2 `listMyApplications` (query)

- **Args**:
  - `limit?` (`number`, default 50, capped at 200)
- **Behavior**:
  - Returns the authenticated candidate’s applications ordered by `createdAt` descending, with associated job data embedded.

### 3.3 `listCompanyApplications` (query)

- **Args**:
  - `companyId` (`Id<"companies">`)
  - `status?` (`"submitted" | "in_review" | "accepted" | "rejected" | "withdrawn"`)
  - `jobId?` (`Id<"jobListings">`)
  - `limit?` (`number`, default 100, capped at 500)
  - `skills?` (`string[]`)
  - `minYearsExperience?` (`number`)
  - `maxYearsExperience?` (`number`)
- **Behavior**:
  - Requires company membership (`admin`, `recruiter`, or `member`).
  - Supports **advanced candidate filtering** when the company plan is `growth`:
    - Skills (fuzzy match).
    - Minimum/maximum years of experience.
  - Uses Convex indexes for company and status, then enriches each application with:
    - Job, applicant user.
    - Profile, experiences, education, certifications, resumes (with signed URLs).

### 3.4 `updateApplicationStatus` (mutation)

- **Args**:
  - `applicationId` (`Id<"applications">`)
  - `status` (`"in_review" | "accepted" | "rejected"`)
- **Behavior**:
  - Requires company role `admin` or `recruiter`.
  - Updates application status, stores decision metadata, and closes the job if:
    - New status is `accepted`.
    - Job has `autoCloseOnAccept = true` and is active.
  - Sends:
    - `job_closed` notifications to other pending candidates when auto-close triggers.
    - `application_status` notification to the applicant with contextual message.

### 3.5 `withdrawApplication` (mutation)

- **Args**:
  - `applicationId` (`Id<"applications">`)
- **Behavior**:
  - Requires that the application belongs to the current user.
  - Prevents withdrawal of already accepted or rejected applications.
  - Sets status to `withdrawn` and updates timestamps.

---

## 4. Convex Functions – Profiles & Resumes

Defined in `convex/profiles.ts`.

### 4.1 `getMyProfile` (query)

- **Args**: none
- **Behavior**:
  - Returns the signed-in user’s profile, experiences, education, certifications, and resumes with signed file URLs.

### 4.2 `getPublicProfile` (query)

- **Args**:
  - `userId` (`Id<"users">`)
- **Behavior**:
  - Returns a public view of a user’s profile and related data (similar to `getMyProfile`) by user ID.

### 4.3 `upsertMyProfile` (mutation)

- **Args**: profile fields such as `firstName`, `lastName`, `headline`, `bio`, `summary`, `location`, contact links, `yearsExperience`, `skills`, `openToWork`.
- **Behavior**:
  - Creates a new profile row if one does not exist; otherwise updates existing profile fields.
  - Normalizes skills and updates timestamps.

### 4.4 Experience, Education, Certifications CRUD

All scoped to the **current user**:

- `addExperience`, `updateExperience`, `deleteExperience`
- `addEducation`, `updateEducation`, `deleteEducation`
- `addCertification`, `updateCertification`, `deleteCertification`

Each:
- Validates ownership of the record.
- Maintains ordering for experiences/education.
- Updates `createdAt` / `updatedAt` fields accordingly.

### 4.5 Resumes & File Handling

- `generateUploadUrl` (mutation)
  - Returns a **signed upload URL** for Convex storage after confirming the user is authenticated.

- `saveResume` (mutation)
  - Args: `title`, `storageId`, `fileName`, `fileSize`, `contentType?`.
  - Validations:
    - Max file size: 10 MB.
    - Max files per user: 10.
  - Behavior:
    - Inserts a resume record for the current user.
    - Sets `isDefault = true` on the first resume.

- `deleteResume` (mutation)
  - Validates ownership of resume, deletes underlying storage object if present.
  - Re-assigns default resume if the deleted one was default.

- `getFileUrl` (query)
  - Args: `storageId` (`Id<"_storage">`).
  - Returns a signed URL for the file.

---

## 5. Other Convex Domains (High-Level)

Additional Convex files provide supporting APIs:

- `convex/companies.ts`, `convex/lib/companies.ts`
  - Company context (current org), plan/limit enforcement, usage metrics.
- `convex/favorites.ts`
  - Add/remove/list job favorites for a user.
- `convex/notifications.ts`
  - In-app notifications list, mark-as-read, counts.
- `convex/sync.ts`
  - Internal mutations used by the Clerk webhook for syncing users, orgs, memberships.

For detailed function signatures and behavior, refer to the corresponding files in the `convex/` directory.

