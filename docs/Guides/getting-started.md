## Getting Started – Jobly (Next.js + Convex + Clerk + Gemini)

This guide walks you through **cloning, configuring, and running** Jobly locally, including Convex, Clerk, and Gemini AI setup.

---

## 1. Prerequisites

- **Node.js** 18+
- **pnpm** package manager:

```bash
npm install -g pnpm
```

- Accounts:
- **Clerk** (auth, orgs, billing)
- **Convex** (database, real-time backend, storage)
- **Google AI Studio / Gemini** (Gemini API)

---

## 2. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/Indeed-Clone-Multi-Tenant-Clerk-Convex-MCP.git
cd Indeed-Clone-Multi-Tenant-Clerk-Convex-MCP
pnpm install
```

---

## 3. Environment Variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

` .env.local` (local only, never commit real secrets):

- **Clerk**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- **Convex**
  - `NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud`
  - `CLERK_JWT_ISSUER_DOMAIN=https://your-instance.clerk.accounts.dev`
  - `CLERK_WEBHOOK_SIGNING_SECRET=whsec_...`
- **App**
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- **Gemini AI**
  - `GEMINI_API_KEY=your_gemini_key_here`

> The Gemini key will be used by server-side code that calls the Gemini API directly, or via an orchestration layer such as the Gemini Agent SDK or LangChain.

---

## 4. Configure Clerk

1. In the **Clerk Dashboard**, create an application.
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`
3. Enable **Organizations** and set up the **Hiring Roles** role set (`org:admin`, `org:recruiter`, `org:member`).
4. Configure **Billing** plans for organizations (Free, Starter, Growth, Enterprise) as described in the internal architecture/plan docs.
5. Set up **webhooks**:
   - Endpoint URL: `https://<YOUR_CONVEX_SITE>/webhooks/clerk`
   - Subscribe to user, organization, and organizationMembership events.
   - Copy the signing secret → `CLERK_WEBHOOK_SIGNING_SECRET` (Convex env).

---

## 5. Configure Convex

From the project root:

```bash
npx convex dev
```

- When prompted, create or link a Convex project.
- Copy the **Convex URL** into `NEXT_PUBLIC_CONVEX_URL`.
- In the **Convex Dashboard → Settings → Environment Variables**, set:
  - `CLERK_JWT_ISSUER_DOMAIN`
  - `CLERK_WEBHOOK_SIGNING_SECRET`
  - (Optionally) `GEMINI_API_KEY` if Convex actions call Gemini directly.

---

## 6. Configure Gemini API & Orchestration

You can use Gemini via:

- **Direct API calls** (REST or official SDK).
- **Gemini Agent SDK** (agentic workflows).
- **LangChain** (for prompt orchestration and tool usage).

Typical pattern (server-side only):

- Store `GEMINI_API_KEY` in environment variables.
- Create a thin **service module** (e.g. `lib/ai/gemini.ts`) that:
  - Accepts high-level intents (parse resume, enrich job, score match).
  - Calls Gemini using Agent SDK or LangChain chains.
  - Returns normalized, typed outputs that can be saved into Convex.

All calls to Gemini should:

- Run on the server only.
- Be rate-limited and plan-gated (e.g. only Growth/Enterprise orgs get full AI features).

---

## 7. Run the App

Start both the Next.js frontend and Convex backend:

```bash
pnpm dev
```

- Next.js dev server: `http://localhost:3000`
- Convex dev server: started by `convex dev` script (used by the app via `NEXT_PUBLIC_CONVEX_URL`).

First-time checklist:

- Sign up via Clerk and reach the candidate dashboard.
- Create an organization and access the company workspace.
- Create a job and apply with a candidate account.
- Confirm Convex webhooks are syncing users and orgs.

---

## 8. Next Steps

- Review **`docs/Project/project-overview.md`** for current system behavior.
- Review **`docs/plan/manatal-style-api-scaling.md`** and **`docs/Project/architecture-manatal-api.md`** for API and AI scaling plans.
- See **`docs/Guides/testing.md`** and **`docs/Guides/troubleshooting.md`** (once implemented) for quality and debugging practices.

