"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Search } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
  in_review: { label: "In review", className: "bg-amber-accent/10 text-amber-accent border-amber-accent/20" },
  accepted: { label: "Accepted", className: "bg-jade/10 text-jade border-jade/20" },
  rejected: { label: "Not selected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  withdrawn: { label: "Withdrawn", className: "border-border text-muted-foreground" },
};

export default function ApplicationsPage() {
  const applications = useQuery(api.applications.listMyApplications, { limit: 100 });
  const withdrawApplication = useMutation(api.applications.withdrawApplication);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [withdrawingApplicationId, setWithdrawingApplicationId] = useState<string | null>(null);

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
          Your applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every role you&apos;ve applied to and see where things stand.
        </p>
      </div>

      {statusText && (
        <p className="text-xs text-muted-foreground">{statusText}</p>
      )}

      {/* Loading */}
      {applications === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {applications?.length === 0 && (
        <Card className="warm-shadow">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No applications yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              You haven&apos;t applied to any jobs. Browse openings to find your next opportunity.
            </p>
            <Button asChild className="mt-2 rounded-full bg-terracotta text-white hover:bg-terracotta/90">
              <Link href="/jobs">
                <Search className="mr-1.5 size-3.5" />
                Browse jobs
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Application list */}
      <div className="space-y-3">
        {applications?.map((application, index) => {
          const config = statusConfig[application.status] ?? statusConfig.submitted;
          return (
            <Card
              key={application._id}
              className="animate-slide-up warm-shadow transition-all hover:warm-shadow-md"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-[family-name:var(--font-bricolage)] text-lg tracking-tight">
                      {application.job?.title ?? "Job unavailable"}
                    </CardTitle>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      {application.job?.companyName ?? "Unknown company"}
                      <span className="text-border">·</span>
                      <MapPin className="size-3" />
                      {application.job?.location ?? "—"}
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
              <CardContent className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Applied {new Date(application.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                {(application.status === "submitted" || application.status === "in_review") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-xs text-muted-foreground hover:text-destructive"
                    disabled={withdrawingApplicationId === application._id}
                    onClick={async () => {
                      setStatusText(null);
                      setWithdrawingApplicationId(application._id);
                      try {
                        await withdrawApplication({ applicationId: application._id });
                        setStatusText("Application withdrawn.");
                      } catch (error) {
                        setStatusText(
                          error instanceof Error ? error.message : "Could not withdraw application.",
                        );
                      } finally {
                        setWithdrawingApplicationId(null);
                      }
                    }}
                  >
                    {withdrawingApplicationId === application._id ? "Withdrawing..." : "Withdraw"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
