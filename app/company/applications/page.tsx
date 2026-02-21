"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, FileText, User, XCircle } from "lucide-react";

type CompanyStatus = "submitted" | "in_review" | "accepted" | "rejected" | "withdrawn";
type DecisionStatus = "in_review" | "accepted" | "rejected";

const statusConfig: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
  in_review: { label: "In review", className: "bg-amber-accent/10 text-amber-accent border-amber-accent/20" },
  accepted: { label: "Accepted", className: "bg-jade/10 text-jade border-jade/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  withdrawn: { label: "Withdrawn", className: "border-border text-muted-foreground" },
};

export default function CompanyApplicationsPage() {
  const { orgId } = useAuth();
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [mutatingApplicationId, setMutatingApplicationId] = useState<string | null>(null);

  const companyContext = useQuery(
    api.companies.getMyCompanyContext,
    orgId ? { clerkOrgId: orgId } : "skip",
  );
  const applications = useQuery(
    api.applications.listCompanyApplications,
    companyContext
      ? {
          companyId: companyContext.companyId,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 200,
        }
      : "skip",
  );
  const updateApplicationStatus = useMutation(api.applications.updateApplicationStatus);

  const canDecide =
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

  if (companyContext === undefined || applications === undefined) {
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
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review candidates and make hiring decisions.
          </p>
        </div>
        <select
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as CompanyStatus | "all")}
        >
          <option value="all">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="in_review">In review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {statusText && <p className="text-xs text-muted-foreground">{statusText}</p>}

      {/* Empty state */}
      {applications.length === 0 && (
        <Card className="warm-shadow">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No applications found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {statusFilter === "all"
                ? "Applications will appear here once candidates apply to your jobs."
                : "No applications match this filter. Try changing the status filter above."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application list */}
      <div className="space-y-3">
        {applications.map((application, index) => {
          const config = statusConfig[application.status] ?? statusConfig.submitted;
          return (
            <Card
              key={application._id}
              className="animate-slide-up warm-shadow transition-all hover:warm-shadow-md"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
                      {application.job?.title ?? "Unknown job"}
                    </CardTitle>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="size-3" />
                      {formatApplicant(application.applicant)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full text-xs ${config.className}`}
                  >
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.coverLetter ? (
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <p className="line-clamp-3 text-sm text-foreground/80">{application.coverLetter}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No cover letter provided.</p>
                )}

                {canDecide && application.status !== "withdrawn" ? (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      disabled={mutatingApplicationId === application._id || application.status === "in_review"}
                      onClick={() => handleStatusUpdate(application._id, "in_review")}
                    >
                      <Clock className="mr-1 size-3" />
                      In review
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full bg-jade text-white text-xs hover:bg-jade/90"
                      disabled={mutatingApplicationId === application._id || application.status === "accepted"}
                      onClick={() => handleStatusUpdate(application._id, "accepted")}
                    >
                      <CheckCircle2 className="mr-1 size-3" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                      disabled={mutatingApplicationId === application._id || application.status === "rejected"}
                      onClick={() => handleStatusUpdate(application._id, "rejected")}
                    >
                      <XCircle className="mr-1 size-3" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {canDecide
                      ? "No actions available for withdrawn applications."
                      : "Read-only access for your role."}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );

  async function handleStatusUpdate(applicationId: string, nextStatus: DecisionStatus) {
    setStatusText(null);
    setMutatingApplicationId(applicationId);
    try {
      await updateApplicationStatus({
        applicationId: applicationId as Parameters<typeof updateApplicationStatus>[0]["applicationId"],
        status: nextStatus,
      });
      setStatusText(`Application moved to ${nextStatus.replace("_", " ")}.`);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Could not update application status.");
    } finally {
      setMutatingApplicationId(null);
    }
  }
}

function formatApplicant(
  applicant: { firstName?: string; lastName?: string; email?: string } | null,
) {
  if (!applicant) return "Unknown applicant";
  const fullName = `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim();
  return fullName || applicant.email || "Unknown applicant";
}
