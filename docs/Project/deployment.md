## Deployment & CI/CD – Jobly (Vercel + Convex + Clerk + Gemini)

This guide describes how to deploy Jobly to **Vercel**, manage the **Convex** backend, configure **Clerk**, and safely use the **Gemini API** in production.

---

## 1. Environments

Recommended environments:

- **Local**: development on your machine.
- **Staging** (optional): pre-production testing.
- **Production**: live environment for real users.

Each environment should have:

- Its own **Convex deployment**.
- Separate **Clerk instance keys** (or at least separate publishable/secret keys).
- Its own **Gemini API key** with appropriate quotas.

---

## 2. Deploying the Frontend to Vercel

### 2.1 Connect GitHub Repository

1. Push your code to GitHub (already set up for this repo).
2. In Vercel:
   - Click **“New Project”**.
   - Import the GitHub repository.
3. Vercel will detect **Next.js** automatically.

### 2.2 Configure Build Settings

- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Output Directory**: `.next`

Ensure `pnpm` is selected or configured per Vercel’s docs.

### 2.3 Environment Variables (Vercel)

Add the following to Vercel **Project Settings → Environment Variables**:

- **Clerk**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- **Convex**
  - `NEXT_PUBLIC_CONVEX_URL=https://<your-prod-project>.convex.cloud`
  - `CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-instance>.clerk.accounts.dev`
- **App**
  - `NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app`
- **Gemini**
  - `GEMINI_API_KEY=<your_prod_gemini_api_key>`

> Do **not** set `CLERK_WEBHOOK_SIGNING_SECRET` in Vercel unless some Next.js routes verify webhooks. That secret is primarily needed in Convex.

After env vars are added, trigger a deployment (Vercel will do this automatically on pushes to the main branch).

---

## 3. Deploying Convex

### 3.1 Initial Production Deploy

From the project root:

```bash
npx convex deploy
```

This will:

- Create or update your Convex production deployment.
- Push schema changes and functions.

### 3.2 Convex Environment Variables (Prod)

In the **Convex Dashboard → Settings → Environment Variables** for the production deployment, set:

- `CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-instance>.clerk.accounts.dev`
- `CLERK_WEBHOOK_SIGNING_SECRET=<svix_secret_from_clerk_webhook>`
- `GEMINI_API_KEY=<your_prod_gemini_api_key>` (if Convex actions call Gemini)
- Any additional internal secrets required by your Convex functions.

Re-deploy Convex if you add or change environment variables.

---

## 4. Configuring Clerk for Production

### 4.1 API Keys & Domains

- Use **production API keys** from Clerk:
  - Update Vercel and Convex env vars accordingly.
- Configure **allowed origins and redirect URLs** to include your:
  - Vercel production domain.
  - Any custom domain you attach (e.g. `app.yourdomain.com`).

### 4.2 Organizations & Billing

- Ensure organization settings and role sets (e.g. Hiring Roles) are configured as in development.
- Set up production **organization plans** (Free, Starter, Growth, Enterprise) and feature entitlements.

### 4.3 Clerk → Convex Webhooks (Prod)

1. In Clerk, create a production webhook endpoint:
   - URL: `https://<your-prod-convex-deployment>.convex.site/webhooks/clerk`
2. Subscribe to the required events:
   - `user.*`, `organization.*`, `organizationMembership.*`
3. Copy the **signing secret** and set it in Convex as `CLERK_WEBHOOK_SIGNING_SECRET`.
4. Replay events if needed to backfill production data.

---

## 5. Gemini & Orchestration in Production

### 5.1 API Keys & Limits

- Use a **production Gemini API key** with:
  - Appropriate quotas for parsing and recommendation workloads.
  - Monitoring/alerts configured in Google Cloud / AI Studio.

### 5.2 Orchestration Choices

You can orchestrate Gemini calls with:

- **Gemini Agent SDK**:
  - Build agent workflows that call tools and subroutines based on user intent.
- **LangChain**:
  - Use chains and tools to implement parsing, enrichment, and recommendation flows.

In both cases:

- Keep orchestration logic in server-side modules (no client-side Gemini calls).
- Normalize all outputs into strongly-typed structures before saving to Convex.
- Add logging/metrics around:
  - Call counts.
  - Latency and failure rates.

### 5.3 Safety & Degradation

- Wrap Gemini calls in try/catch with:
  - Fallback to non-AI flows (basic search, rule-based matching) when AI is unavailable.
  - Clear error messaging in internal logs, not exposed in user-facing UI.
- Respect **plan-based gating**:
  - Only Growth/Enterprise orgs should access AI-heavy endpoints at scale.

---

## 6. CI/CD (GitHub Actions – High-Level Plan)

Recommended pipeline for `main` branch:

1. **Checkout & install**
   - `pnpm install`
2. **Static checks**
   - `pnpm lint`
   - `pnpm test` (once tests are configured)
3. **Build**
   - `pnpm build`
4. **Deploy**
   - Vercel: via GitHub integration (automatic when checks pass).
   - Convex: either manually (`npx convex deploy`) or via:
     - A protected workflow that runs on tagged releases.

Keep Convex deploys **explicit and intentional**; avoid automatic deploy on every commit unless you have strong testing in place.

---

## 7. Post-Deployment Checklist

After deploying to production:

- [ ] Frontend loads at your Vercel domain / custom domain.
- [ ] Clerk sign-in/up flows work with production keys.
- [ ] Organizations can be created and switched.
- [ ] Jobs can be created, searched, and viewed as both candidate and employer.
- [ ] Applications can be submitted and reviewed.
- [ ] Clerk webhooks deliver successfully to Convex (no 4xx/5xx in the dashboard).
- [ ] Gemini-powered features (if enabled) behave correctly and degrade gracefully when disabled.

