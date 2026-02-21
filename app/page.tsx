import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, BriefcaseBusiness, Building2, Heart, Search, Shield, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <SiteLogo />

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/jobs"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Browse jobs
              </Link>
              <Link
                href="/company"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                For companies
              </Link>
              <Link
                href="/pricing"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/">
                <Button variant="ghost" size="sm" className="rounded-full text-sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/">
                <Button
                  size="sm"
                  className="rounded-full bg-terracotta text-white hover:bg-terracotta/90"
                >
                  Get started free
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/jobs">Dashboard</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="animate-fade-in space-y-8 text-center">
          <Badge className="mx-auto rounded-full border-terracotta/20 bg-terracotta/10 px-4 py-1.5 text-sm font-medium text-terracotta hover:bg-terracotta/10">
            <Sparkles className="mr-1.5 size-3.5" />
            Always free for job seekers
          </Badge>

          <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-bricolage)] text-4xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-7xl">
            Find work that fits{" "}
            <span className="text-terracotta">your life</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Search roles, save favorites, apply in minutes, and track every
            application in one calm workspace. No noise, no clutter.
          </p>

          <div className="animate-slide-up stagger-2 flex items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-terracotta px-8 text-white hover:bg-terracotta/90"
            >
              <Link href="/jobs">
                <Search className="mr-2 size-4" />
                Browse jobs
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              <Link href="/company">
                For companies
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Two paths */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* For Job Seekers */}
          <div className="animate-slide-up stagger-3 group relative overflow-hidden rounded-2xl border border-border bg-card p-8 warm-shadow transition-all hover:warm-shadow-md">
            <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-jade/10 text-jade">
              <Heart className="size-6" />
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
              Looking for your next role?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Browse openings, save the ones you like, and apply when you&apos;re
              ready. Your applications and favorites are always in one place.
            </p>
            <ul className="mb-8 space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-jade/10 text-jade">
                  <Search className="size-3" />
                </span>
                Smart search with filters for location, type, and more
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-jade/10 text-jade">
                  <Heart className="size-3" />
                </span>
                Save jobs and come back to them anytime
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-jade/10 text-jade">
                  <Shield className="size-3" />
                </span>
                Clear status updates on every application
              </li>
            </ul>
            <Button
              asChild
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href="/jobs">
                Browse jobs
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>

          {/* For Companies */}
          <div className="animate-slide-up stagger-4 group relative overflow-hidden rounded-2xl border border-border bg-card p-8 warm-shadow transition-all hover:warm-shadow-md">
            <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
              <Building2 className="size-6" />
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
              Hiring for your team?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Post jobs, review applicants, and make decisions as a team.
              Manage everything from a single company workspace.
            </p>
            <ul className="mb-8 space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                  <BriefcaseBusiness className="size-3" />
                </span>
                Post and manage job listings with ease
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                  <Users className="size-3" />
                </span>
                Invite your team with role-based access
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                  <Sparkles className="size-3" />
                </span>
                Flexible plans from free to Growth
              </li>
            </ul>
            <Button
              asChild
              className="rounded-full bg-terracotta text-white hover:bg-terracotta/90"
            >
              <Link href="/company">
                Company workspace
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Trust bar */}
        <section className="animate-slide-up stagger-5 rounded-2xl border border-border bg-card p-6 warm-shadow">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="font-[family-name:var(--font-bricolage)] text-3xl font-bold tracking-tight">
                $0
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Always free for candidates
              </p>
            </div>
            <div className="text-center">
              <p className="font-[family-name:var(--font-bricolage)] text-3xl font-bold tracking-tight">
                3 plans
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Free, Starter, and Growth for companies
              </p>
            </div>
            <div className="text-center">
              <p className="font-[family-name:var(--font-bricolage)] text-3xl font-bold tracking-tight">
                10 seats
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Scale your hiring team as you grow
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-12 text-center text-sm text-muted-foreground">
          <p>
            Built with care.{" "}
            <Link href="/pricing" className="underline underline-offset-4 hover:text-foreground">
              View pricing
            </Link>{" "}
            or{" "}
            <Link href="/jobs" className="underline underline-offset-4 hover:text-foreground">
              start browsing
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
