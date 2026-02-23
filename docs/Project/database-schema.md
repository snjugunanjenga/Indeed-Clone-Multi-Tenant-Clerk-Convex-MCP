## Database Schema – Jobly (Convex)

This document summarizes the current **Convex schema** used by Jobly. It focuses on the logical data model rather than implementation specifics, and serves as a reference for extending the system toward Manatal-style object coverage.

Source of truth: `convex/schema.ts`.

---

## 1. Users & Profiles

### 1.1 `users`

Represents a person in the system, synced from **Clerk**.

Key fields:

- `clerkUserId` (string) – foreign reference to Clerk.
- `email?`, `firstName?`, `lastName?`, `imageUrl?`.
- `createdAt`, `updatedAt` (number – timestamps).

Indexes:

- `by_clerkUserId` – fast lookup from Clerk events.

### 1.2 `profiles`

Extended candidate-facing profile information.

Key fields:

- `userId` (`Id<"users">`) – owner.
- `firstName?`, `lastName?`, `headline?`, `bio?`, `summary?`.
- `location?`, `phone?`, `website?`, `linkedinUrl?`, `githubUrl?`.
- `yearsExperience?` (number).
- `skills` (string[]).
- `openToWork` (boolean).
- `updatedAt`.

Indexes:

- `by_userId`.

### 1.3 Work & Education History

#### `experiences`

- `userId`, `title`, `company`, `location?`.
- `startDate`, `endDate?`, `isCurrent`.
- `description?`, `order`, `createdAt`, `updatedAt`.

Indexes:

- `by_userId`.
- `by_userId_order` – supports ordered timelines and drag-and-drop reordering.

#### `education`

- `userId`, `school`, `degree?`, `fieldOfStudy?`.
- `startDate?`, `endDate?`, `description?`, `order`.
- `createdAt`, `updatedAt`.

Indexes:

- `by_userId`.
- `by_userId_order`.

#### `certifications`

- `userId`, `name`, `issuingOrg`.
- `issueDate?`, `expirationDate?`, `credentialUrl?`.
- `createdAt`, `updatedAt`.

Index:

- `by_userId`.

### 1.4 `resumes`

Represents uploaded resume files in Convex storage.

Key fields:

- `userId`.
- `title`.
- `storageId?` (`Id<"_storage">`) – Convex storage reference.
- `fileUrl?` – optional external URL.
- `fileName`, `fileSize?`, `contentType?`.
- `isDefault` (boolean).
- `createdAt`, `updatedAt`.

Indexes:

- `by_userId`.
- `by_userId_isDefault` – fast lookup of default resume.

---

## 2. Companies & Memberships

### 2.1 `companies`

Represents a company workspace, mapped from a **Clerk Organization**.

Key fields:

- `clerkOrgId` (string).
- `name`, `slug?`, `logoUrl?`, `website?`, `description?`, `location?`.
- `createdByUserId?` (`Id<"users">`).
- Plan/limits:
  - `plan?` – `"free" | "starter" | "growth"`.
  - `seatLimit?`, `jobLimit?`.
- `createdAt`, `updatedAt`.

Indexes:

- `by_clerkOrgId`.
- `by_slug`.

### 2.2 `companyMembers`

Membership + role for a user inside a company.

Key fields:

- `companyId` (`Id<"companies">`), `userId` (`Id<"users">`).
- `clerkOrgId` (string), `clerkUserId` (string).
- `role` – `"admin" | "recruiter" | "member"`.
- `status` – `"active" | "invited" | "suspended" | "removed"`.
- `joinedAt?`, `createdAt`, `updatedAt`.

Indexes:

- `by_companyId`.
- `by_userId`.
- `by_companyId_userId` – permissions and membership lookups.
- `by_clerkOrgId_clerkUserId` – sync from Clerk webhooks.

---

## 3. Jobs, Applications & Favorites

### 3.1 `jobListings`

Represents an individual job posting.

Key fields:

- `companyId` (`Id<"companies">`), `companyName`.
- `title`, `description` (HTML), `location`.
- `employmentType` – `"full_time" | "part_time" | "contract" | "internship" | "temporary"`.
- `workplaceType` – `"on_site" | "remote" | "hybrid"`.
- `salaryMin?`, `salaryMax?`, `salaryCurrency?`.
- `tags` (string[]).
- `searchText` (string) – denormalized composite text for full-text search.
- `isActive` (boolean), `featured` (boolean), `autoCloseOnAccept?` (boolean).
- `applicationCount` (number).
- `postedByUserId` (`Id<"users">`).
- `createdAt`, `updatedAt`, `closedAt?`.

Indexes:

- `by_companyId`.
- `by_companyId_isActive`.
- `by_isActive_createdAt` – efficient listing of active jobs.
- `by_workplaceType`, `by_employmentType`.
- `searchIndex "search_jobs"`:
  - `searchField`: `searchText`.
  - `filterFields`: `isActive`, `companyId`, `workplaceType`, `employmentType`.

### 3.2 `applications`

Represents a candidate’s application for a specific job.

Key fields:

- `jobId` (`Id<"jobListings">`), `companyId` (`Id<"companies">`).
- `applicantUserId` (`Id<"users">`).
- `status` – `"submitted" | "in_review" | "accepted" | "rejected" | "withdrawn"`.
- `coverLetter?` (string).
- `resumeId?` (`Id<"resumes">`).
- `answers?` – array of `{ question, answer }`.
- `decidedByUserId?` (`Id<"users">`), `decidedAt?`.
- `createdAt`, `updatedAt`.

Indexes:

- `by_applicantUserId_createdAt` – candidate’s application history.
- `by_jobId_createdAt` – per-job applications.
- `by_companyId_status` – company-wide status filtering.
- `by_companyId_createdAt` – company recent activity.
- `by_jobId_applicantUserId` – prevent duplicate apps by user per job.

### 3.3 `favorites`

Candidate-saved jobs.

Key fields:

- `userId` (`Id<"users">`).
- `jobId` (`Id<"jobListings">`).
- `createdAt`.

Indexes:

- `by_userId`.
- `by_userId_jobId`.
- `by_jobId`.

---

## 4. Notifications

### 4.1 `notifications`

In-app notifications for users.

Key fields:

- `userId` (`Id<"users">`).
- `type` – `"application_status" | "application_received" | "job_closed" | "system"`.
- `title`, `message`.
- `linkUrl?` (string).
- `metadata?` (`any`) – structured JSON payload.
- `isRead` (boolean), `readAt?`.
- `createdAt`.

Indexes:

- `by_userId_createdAt` – sorted notification feed.
- `by_userId_isRead_createdAt` – unread counts and filters.

---

## 5. Extending Toward Manatal-Style Coverage

The existing schema already covers:

- Candidates and their structured data (profiles, resumes, history).
- Companies, job postings, and applications.
- Favorites and notifications.

To more closely match Manatal’s object model (see [Manatal docs](https://developers.manatal.com/reference/getting-started)), we can introduce additional tables:

- `candidateNotes`, `jobNotes` – rich notes attached to candidates/jobs.
- `candidateActivities`, `jobActivities` – timeline events.
- `attachments` – generalized attachments linked to candidates, jobs, or matches.
- `matches` – explicit candidate↔job relationships beyond applications.
- `taxonomies` – `languages`, `industries`, `currencies`, `nationalities`, `matchStages`, `jobPipelines`.

These extensions should follow the same patterns:

- Clear foreign keys referencing core tables.
- Indexes for most common query patterns.
- Optional denormalization (e.g. names, titles) for fast display.

The combination of the current schema and these planned extensions enables the **Manatal-style REST API** described in:

- `docs/Project/prd.md` (Manatal-style requirements section)
- `docs/Project/architecture-manatal-api.md`
- `docs/plan/manatal-style-api-scaling.md`

