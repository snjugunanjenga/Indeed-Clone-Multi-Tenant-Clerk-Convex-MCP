import { PricingTable, Protect } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingUsageCards } from "../_components/billing-usage-cards";

export default async function CompanyBillingPage() {
  const { has, orgId } = await auth();
  if (!orgId) {
    return (
      <section className="rounded-lg border p-4 text-sm text-muted-foreground">
        Select or create an organization first, then return to billing.
      </section>
    );
  }

  const hasStarterPlan = has({ plan: "starter" });
  const hasGrowthPlan = has({ plan: "growth" });
  const hasAdvancedFilters = has({ feature: "advanced_filters" });
  const hasInvitePermission = has({ permission: "org:team_management:invite" });
  const currentPlan = hasGrowthPlan ? "growth" : hasStarterPlan ? "starter" : "free";
  const seatLimit = currentPlan === "growth" ? 10 : currentPlan === "starter" ? 3 : 1;
  const jobLimit = currentPlan === "growth" ? 25 : currentPlan === "starter" ? 5 : 1;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Billing is organization-based. Access is enforced with server-side `has()` checks and
          UI `&lt;Protect&gt;` guards.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <AccessRow label={`Current plan: ${currentPlan}`} enabled />
        <AccessRow label={`Seat limit: ${seatLimit}`} enabled />
        <AccessRow label={`Active job limit: ${jobLimit}`} enabled />
        <AccessRow label="Plan: starter" enabled={hasStarterPlan} />
        <AccessRow label="Plan: growth" enabled={hasGrowthPlan} />
        <AccessRow label="Feature: advanced_filters" enabled={hasAdvancedFilters} />
        <AccessRow
          label="Permission: org:team_management:invite"
          enabled={hasInvitePermission}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current usage</CardTitle>
          <CardDescription>
            Usage is read from Convex product data, while plan entitlements come from Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingUsageCards seatLimit={seatLimit} jobLimit={jobLimit} />
        </CardContent>
      </Card>

      <Protect
        role="org:admin"
        fallback={
          <div className="rounded-lg border p-4 text-sm">
            Only organization admins can update billing.
          </div>
        }
      >
        <div className="rounded-lg border p-4">
          <PricingTable for="organization" />
        </div>
      </Protect>
    </section>
  );
}

function AccessRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-sm">
        Status:{" "}
        <span className={enabled ? "text-green-600" : "text-amber-600"}>
          {enabled ? "granted" : "not granted"}
        </span>
      </p>
    </div>
  );
}
