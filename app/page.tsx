import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Jobly</h1>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border px-4 py-2 text-sm">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
                Create account
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <section className="space-y-5">
        <p className="text-sm uppercase tracking-wide text-slate-500">Indeed-style marketplace</p>
        <h2 className="max-w-3xl text-4xl font-bold leading-tight">
          Candidates discover jobs. Companies post roles, manage applicants, and upgrade plans.
        </h2>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Phase 1 focuses on auth, organization-based access, and billing gates with Clerk
          organizations and plans.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-md border px-4 py-2 text-sm">
            Candidate app
          </Link>
          <Link href="/company" className="rounded-md border px-4 py-2 text-sm">
            Company dashboard
          </Link>
          <Link
            href="/company/billing"
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            Company billing
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-5">
          <h3 className="text-lg font-semibold">Candidates (free)</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Search jobs, save listings, and track applications.
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="text-lg font-semibold">Companies (paid tiers)</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Post jobs, review applicants, manage members, and unlock features via billing plans.
          </p>
        </div>
      </section>
    </main>
  );
}
