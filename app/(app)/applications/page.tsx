"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusTone: Record<string, "outline" | "secondary" | "default"> = {
  submitted: "secondary",
  in_review: "outline",
  accepted: "default",
  rejected: "outline",
  withdrawn: "outline",
};

export default function ApplicationsPage() {
  const applications = useQuery(api.applications.listMyApplications, { limit: 100 });
  const withdrawApplication = useMutation(api.applications.withdrawApplication);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [withdrawingApplicationId, setWithdrawingApplicationId] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My applications</CardTitle>
          <CardDescription>Track every role you have applied to.</CardDescription>
        </CardHeader>
      </Card>
      {statusText ? <p className="text-xs text-muted-foreground">{statusText}</p> : null}

      {applications === undefined && <p className="text-sm text-muted-foreground">Loading applications...</p>}
      {applications?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            No applications yet. Start applying from the jobs page.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {applications?.map((application) => (
          <Card key={application._id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">
                  {application.job?.title ?? "Job unavailable"}
                </CardTitle>
                <Badge variant={statusTone[application.status] ?? "outline"}>
                  {application.status.replace("_", " ")}
                </Badge>
              </div>
              <CardDescription>
                {application.job?.companyName ?? "Unknown company"} • Applied{" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{application.job?.location ?? "Location unavailable"}</p>
              {(application.status === "submitted" || application.status === "in_review") && (
                <Button
                  size="sm"
                  variant="outline"
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
        ))}
      </div>
    </section>
  );
}
