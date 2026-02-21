import Link from "next/link";
import { Protect } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanySummaryCards } from "./_components/company-summary-cards";
import { ArrowRight, BriefcaseBusiness, CreditCard, FileText, Lock, Shield, Sparkles, Users } from "lucide-react";

export default async function CompanyDashboardPage() {
  const { has, orgId } = await auth();
  if (!orgId) {
    return (
      <Card className="warm-shadow">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="font-medium">Select an organization</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Use the organization switcher above to pick your company workspace.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canInviteTeam = has({ feature: "team_management" });
  const canPostMoreJobs = has({ feature: "job_posting" });
  const canManageInvites = has({ permission: "org:team_management:invite" });
  const canManageJobs = has({ role: "org:admin" }) || has({ role: "org:recruiter" });

  return (
    <section className="animate-fade-in space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
          Company dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of your workspace, jobs, and team.
        </p>
      </div>

      <CompanySummaryCards orgId={orgId} />

      {/* Feature status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={Users}
          title="Team invites"
          description="Invite members to your organization"
          enabled={canInviteTeam && canManageInvites}
        />
        <FeatureCard
          icon={BriefcaseBusiness}
          title="Job posting"
          description="Create and publish job listings"
          enabled={canPostMoreJobs}
        />
        <FeatureCard
          icon={Shield}
          title="Job management"
          description="Edit, close, and reopen listings"
          enabled={canManageJobs}
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
              <BriefcaseBusiness className="size-4 text-terracotta" />
              Jobs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and manage your active listings.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/company/jobs">
                View all jobs
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
            <Protect permission="org:job_posting:manage" fallback={null}>
              <Button asChild size="sm" className="rounded-full bg-terracotta text-white hover:bg-terracotta/90">
                <Link href="/company/jobs/new">
                  <Sparkles className="mr-1 size-3.5" />
                  Post new job
                </Link>
              </Button>
            </Protect>
          </CardContent>
        </Card>

        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
              <FileText className="size-4 text-jade" />
              Applications
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review candidates and make hiring decisions.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/company/applications">
                Review applications
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Protect
        role="org:admin"
        fallback={
          <Card className="warm-shadow">
            <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
              <Lock className="size-4" />
              Only organization admins can manage billing.
            </CardContent>
          </Card>
        }
      >
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
              <CreditCard className="size-4 text-amber-accent" />
              Billing
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upgrade your plan and manage workspace limits.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/company/billing">
                Open billing
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Protect>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <Card className="warm-shadow">
      <CardContent className="flex items-start gap-3 p-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${enabled ? "bg-jade/10 text-jade" : "bg-secondary text-muted-foreground"}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className={`mt-1.5 text-xs font-medium ${enabled ? "text-jade" : "text-amber-accent"}`}>
            {enabled ? "Enabled" : "Locked — upgrade to unlock"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
