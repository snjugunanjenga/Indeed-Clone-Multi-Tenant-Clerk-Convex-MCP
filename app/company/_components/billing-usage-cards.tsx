"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

export function BillingUsageCards({
  seatLimit,
  jobLimit,
}: {
  seatLimit: number;
  jobLimit: number;
}) {
  const { orgId } = useAuth();
  const companyContext = useQuery(
    api.companies.getMyCompanyContext,
    orgId ? { clerkOrgId: orgId } : "skip",
  );
  const usage = useQuery(
    api.companies.getCompanyUsage,
    companyContext ? { companyId: companyContext.companyId } : "skip",
  );

  if (!orgId || companyContext === undefined || usage === undefined) {
    return <p className="text-sm text-muted-foreground">Loading usage...</p>;
  }

  if (!companyContext) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Organization data is still syncing. Refresh in a few seconds.
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You do not currently have active workspace membership in this organization.
        </CardContent>
      </Card>
    );
  }

  const seatsUsed = usage.activeMemberCount;
  const jobsUsed = usage.activeJobCount;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <UsageCard
        label="Seats"
        used={seatsUsed}
        limit={seatLimit}
        helper={`${usage.invitedMemberCount} invited pending`}
      />
      <UsageCard
        label="Active jobs"
        used={jobsUsed}
        limit={jobLimit}
        helper={`${usage.totalJobCount} total listings`}
      />
    </div>
  );
}

function UsageCard({
  label,
  used,
  limit,
  helper,
}: {
  label: string;
  used: number;
  limit: number;
  helper: string;
}) {
  const ratio = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const overLimit = used > limit;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          {used} / {limit} used
        </p>
        <div className="h-2 rounded-full bg-muted">
          <div
            className={`h-2 rounded-full ${overLimit ? "bg-amber-600" : "bg-emerald-600"}`}
            style={{ width: `${ratio}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{helper}</p>
        {overLimit ? (
          <p className="text-xs text-amber-600">
            Over plan limit. Upgrade or reduce usage.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
