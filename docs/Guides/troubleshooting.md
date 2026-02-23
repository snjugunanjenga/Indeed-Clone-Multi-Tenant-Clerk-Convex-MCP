## Troubleshooting Guide – Jobly

Common issues and quick checks for running and integrating with Jobly (Next.js + Convex + Clerk + Gemini).

---

## 1. Installation & Startup

### 1.1 `pnpm install` fails or is slow

- **Check Node version**: must be Node 18+.
- **Try clearing cache**:

```bash
pnpm store prune
pnpm install
```

If corporate proxies/firewalls are involved, verify registry access (`npm ping`).

### 1.2 `pnpm dev` only starts one server

- The `dev` script runs **Next.js** and **Convex** in parallel.
- If you see only one server:
  - Make sure `npm-run-all2` is installed (it’s in `devDependencies`).
  - Run Convex in a separate terminal as a fallback:

```bash
npx convex dev
pnpm dev
```

---

## 2. Environment & Auth Issues

### 2.1 Blank page or infinite loading

Most often caused by a missing or invalid **Convex URL**.

Checklist:

- `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`.
- The URL matches your Convex deployment (dev or prod).
- Restart dev server after changing env vars.

### 2.2 Clerk sign-in/sign-up not working

- Double-check:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- Ensure these are the **development keys** when running locally.
- Confirm that the URL (`http://localhost:3000`) is added as an allowed origin in the Clerk dashboard.

### 2.3 Company pages redirect back to sign-in or home

- You must:
  - Be signed in, and
  - Have at least one **organization** (company workspace) selected.
- On first visit, use the pricing/billing or company pages that render:
  - `<CreateOrganization />` when no org exists.
  - `<OrganizationSwitcher />` to select the active org.

---

## 3. Webhooks & Sync (Clerk ↔ Convex)

### 3.1 Clerk webhooks show 400 / 500 errors

Symptoms:

- In Clerk’s Webhooks dashboard, deliveries show 4xx/5xx responses.

Checklist:

1. **Endpoint URL**
   - Must be: `https://<YOUR_CONVEX_SITE>/webhooks/clerk`
   - Ensure there is no missing `/webhooks` segment or extra path.
2. **Signing secret**
   - In Clerk, copy the endpoint’s **signing secret**.
   - In Convex, set `CLERK_WEBHOOK_SIGNING_SECRET` in environment variables (for the correct deployment).
3. **Subscribed events**
   - Enable:
     - `user.created`, `user.updated`, `user.deleted`
     - `organization.created`, `organization.updated`, `organization.deleted`
     - `organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted`
4. **Deploy Convex code**
   - Make sure `convex/http.ts` (the `/webhooks/clerk` route) is deployed via:

```bash
npx convex dev
```

If deliveries fail, fix the issue and **replay** from the Clerk dashboard.

---

## 4. Convex & Data Issues

### 4.1 “Index not found” or schema errors

- Run:

```bash
npx convex dev
```

- This pushes schema changes and (re)generates the types in `convex/_generated/`.
- If you changed field types, you may need to adjust existing data or reseed using `convex/seed.ts`.

### 4.2 Job search returns no results

Verify:

- At least one **job listing** exists and is `isActive = true`.
- `searchText` is being populated in `convex/jobs.ts` (it is built from title, description, location, company name, and tags).
- Your search query is not overly restrictive (clear filters and try again).

### 4.3 Applications or favorites disappear unexpectedly

- Confirm that:
  - You’re signed in as the same user who created them.
  - No recent schema or logic changes have been made without migrating data.
- Use Convex dashboard to inspect:
  - `applications` table (filters by `applicantUserId` and `companyId`).
  - `favorites` table (filters by `userId`).

---

## 5. Gemini / AI Issues

### 5.1 Gemini calls failing

Symptoms:

- Errors when trying to parse resumes or get recommendations.

Checklist:

- `GEMINI_API_KEY` is set (in `.env.local` and/or Convex env if Convex actions call Gemini).
- The key has the correct **permissions/quotas** in Google AI Studio.
- No network restrictions are blocking calls from your environment.

Best practices:

- Wrap Gemini calls in a small module (e.g. `lib/ai/gemini.ts`) and:
  - Add logging for failures (without logging full prompts or PII).
  - Implement retries with backoff for transient failures.
  - Provide graceful fallbacks (e.g. standard search if AI ranking fails).

### 5.2 Langchain / Gemini Agent orchestration issues

If using LangChain or the Gemini Agent SDK:

- Keep orchestration logic **stateless and testable**:
  - Accept explicit inputs (job, candidate, org context).
  - Return structured outputs that can be validated in tests.
- Use **mocked Gemini** in tests so orchestration can be verified without live API calls.

---

## 6. Deployment & CI/CD

### 6.1 Vercel deployment issues

- Double-check:
  - All required env vars are set in Vercel:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
    - `NEXT_PUBLIC_CONVEX_URL`
    - `CLERK_JWT_ISSUER_DOMAIN`
    - `NEXT_PUBLIC_APP_URL`
    - `GEMINI_API_KEY` (if frontend or server actions call Gemini)
  - Convex production deployment is live (`npx convex deploy`).
  - Clerk prod keys and webhooks are configured for the production Convex URL.

If builds fail:

- Run `pnpm lint` and `pnpm build` locally and fix errors before re-deploying.

---

## 7. When to Ask for Help

If you are stuck:

- Check:
  - `README.md` for high-level setup.
  - `docs/Project/roadmap.md` and `docs/Project/architecture-manatal-api.md` for architectural context.
  - `docs/Guides/testing.md` to see expected testing setup.
- Capture:
  - Exact error message and stack trace (if any).
  - The endpoint or page you were using.
  - Recent changes (code, env vars, dependencies).

Then open an issue or contact the project owner with this information so the problem can be triaged efficiently.

