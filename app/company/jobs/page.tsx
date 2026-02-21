"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseBusiness, Eye, EyeOff, MapPin, Plus, RotateCcw, ToggleLeft, ToggleRight, X } from "lucide-react";

export default function CompanyJobsPage() {
  const { orgId } = useAuth();
  const [includeClosed, setIncludeClosed] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [mutatingJobId, setMutatingJobId] = useState<string | null>(null);

  const companyContext = useQuery(
    api.companies.getMyCompanyContext,
    orgId ? { clerkOrgId: orgId } : "skip",
  );
  const jobs = useQuery(
    api.jobs.listCompanyJobs,
    companyContext
      ? { companyId: companyContext.companyId, includeClosed, limit: 100 }
      : "skip",
  );
  const closeJobListing = useMutation(api.jobs.closeJobListing);
  const updateJobListing = useMutation(api.jobs.updateJobListing);

  const canManage =
    companyContext?.role === "admin" || companyContext?.role === "recruiter";

  if (!orgId) {
    return (
      <Card className="warm-shadow">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Select an organization to continue.
        </CardContent>
      </Card>
    );
  }

  if (companyContext === undefined || jobs === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (!companyContext) {
    return (
      <Card className="warm-shadow">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Your organization data is still syncing. Refresh in a few seconds.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
            Job listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your company&apos;s open and closed positions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setIncludeClosed((v) => !v)}
          >
            {includeClosed ? <EyeOff className="mr-1.5 size-3.5" /> : <Eye className="mr-1.5 size-3.5" />}
            {includeClosed ? "Hide closed" : "Show closed"}
          </Button>
          {canManage && (
            <Button asChild size="sm" className="rounded-full bg-terracotta text-white hover:bg-terracotta/90">
              <Link href="/company/jobs/new">
                <Plus className="mr-1.5 size-3.5" />
                New listing
              </Link>
            </Button>
          )}
        </div>
      </div>

      {statusText && <p className="text-xs text-muted-foreground">{statusText}</p>}

      {/* Empty state */}
      {jobs.length === 0 && (
        <Card className="warm-shadow">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-terracotta/10">
              <BriefcaseBusiness className="size-5 text-terracotta" />
            </div>
            <p className="font-medium">No job listings yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Post your first job to start receiving applications from candidates.
            </p>
            {canManage && (
              <Button asChild className="mt-2 rounded-full bg-terracotta text-white hover:bg-terracotta/90">
                <Link href="/company/jobs/new">
                  <Plus className="mr-1.5 size-3.5" />
                  Post your first job
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Job list */}
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <Card
            key={job._id}
            className="animate-slide-up warm-shadow transition-all hover:warm-shadow-md"
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
                    {job.title}
                  </CardTitle>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3" />
                    {job.location}
                    <span className="text-border">·</span>
                    {job.workplaceType.replace("_", " ")}
                    <span className="text-border">·</span>
                    {job.employmentType.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.autoCloseOnAccept && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      Auto-close
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`rounded-full text-xs ${
                      job.isActive
                        ? "border-jade/20 bg-jade/10 text-jade"
                        : "text-muted-foreground"
                    }`}
                  >
                    {job.isActive ? "Active" : "Closed"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{job.applicationCount} application{job.applicationCount !== 1 ? "s" : ""}</span>
                <span className="text-border">·</span>
                <span>Updated {new Date(job.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-border">·</span>
                <span className="font-medium text-foreground">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
              </div>

              {canManage ? (
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  {job.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      disabled={mutatingJobId === job._id}
                      onClick={async () => {
                        setStatusText(null);
                        setMutatingJobId(job._id);
                        try {
                          await closeJobListing({
                            companyId: companyContext.companyId,
                            jobId: job._id,
                          });
                          setStatusText("Job listing closed.");
                        } catch (error) {
                          setStatusText(error instanceof Error ? error.message : "Could not close job listing.");
                        } finally {
                          setMutatingJobId(null);
                        }
                      }}
                    >
                      <X className="mr-1 size-3" />
                      Close listing
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      disabled={mutatingJobId === job._id}
                      onClick={async () => {
                        setStatusText(null);
                        setMutatingJobId(job._id);
                        try {
                          await updateJobListing({
                            companyId: companyContext.companyId,
                            jobId: job._id,
                            isActive: true,
                          });
                          setStatusText("Job listing reopened.");
                        } catch (error) {
                          setStatusText(error instanceof Error ? error.message : "Could not reopen job listing.");
                        } finally {
                          setMutatingJobId(null);
                        }
                      }}
                    >
                      <RotateCcw className="mr-1 size-3" />
                      Reopen
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                    <Link href={`/company/jobs/${job._id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-xs text-muted-foreground"
                    disabled={mutatingJobId === job._id}
                    onClick={async () => {
                      setStatusText(null);
                      setMutatingJobId(job._id);
                      try {
                        await updateJobListing({
                          companyId: companyContext.companyId,
                          jobId: job._id,
                          autoCloseOnAccept: !job.autoCloseOnAccept,
                        });
                        setStatusText(
                          !job.autoCloseOnAccept
                            ? "Auto-close on accept enabled."
                            : "Auto-close on accept disabled.",
                        );
                      } catch (error) {
                        setStatusText(error instanceof Error ? error.message : "Could not update auto-close setting.");
                      } finally {
                        setMutatingJobId(null);
                      }
                    }}
                  >
                    {job.autoCloseOnAccept ? <ToggleRight className="mr-1 size-3" /> : <ToggleLeft className="mr-1 size-3" />}
                    {job.autoCloseOnAccept ? "Disable auto-close" : "Enable auto-close"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Read-only access for your role.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function formatSalary(salaryMin?: number, salaryMax?: number, salaryCurrency?: string) {
  if (salaryMin === undefined && salaryMax === undefined) return "Salary not specified";
  const currency = salaryCurrency ?? "USD";
  if (salaryMin !== undefined && salaryMax !== undefined) return `${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()} ${currency}`;
  return `${(salaryMin ?? salaryMax ?? 0).toLocaleString()} ${currency}`;
}
