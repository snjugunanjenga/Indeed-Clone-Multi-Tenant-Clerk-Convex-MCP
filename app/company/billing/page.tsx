import { PricingTable, Protect } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function CompanyBillingPage() {
  const { has } = await auth();

  const hasStarterPlan = has({ plan: "starter" });
  const hasGrowthPlan = has({ plan: "growth" });
  const hasAdvancedFilters = has({ feature: "advanced_filters" });
  const hasInvitePermission = has({ permission: "org:team_management:invite" });

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
        <AccessRow label="Plan: starter" enabled={hasStarterPlan} />
        <AccessRow label="Plan: growth" enabled={hasGrowthPlan} />
        <AccessRow label="Feature: advanced_filters" enabled={hasAdvancedFilters} />
        <AccessRow
          label="Permission: org:team_management:invite"
          enabled={hasInvitePermission}
        />
      </div>

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
        Status: <span className={enabled ? "text-green-600" : "text-amber-600"}>{enabled ? "granted" : "not granted"}</span>
      </p>
    </div>
  );
}
