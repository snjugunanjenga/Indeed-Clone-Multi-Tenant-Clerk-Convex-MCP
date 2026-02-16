import Link from "next/link";
import { Protect } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function CompanyDashboardPage() {
  const { has, orgId } = await auth();
  const canInviteTeam = has({ feature: "team_management" });
  const canPostMoreJobs = has({ feature: "job_posting" });
  const canManageInvites = has({ permission: "org:team_management:invite" });

  return (
    <section className="space-y-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm">
          Active organization: <span className="font-mono">{orgId}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard
          title="Team invites"
          enabled={canInviteTeam && canManageInvites}
          description="Feature + permission check: org:team_management:invite"
        />
        <FeatureCard
          title="Job posting"
          enabled={canPostMoreJobs}
          description="Feature check: job_posting"
        />
      </div>

      <Protect
        role="org:admin"
        fallback={
          <p className="rounded-lg border p-4 text-sm">
            Only organization admins can manage billing.
          </p>
        }
      >
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Billing controls</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Upgrade plans and manage limits.
          </p>
          <Link href="/company/billing" className="mt-3 inline-block rounded-md border px-3 py-2 text-sm">
            Open billing
          </Link>
        </div>
      </Protect>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <article className="rounded-lg border p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <p className="mt-3 text-sm">
        Status: <span className={enabled ? "text-green-600" : "text-amber-600"}>{enabled ? "enabled" : "locked"}</span>
      </p>
      {!enabled && (
        <p className="mt-1 text-xs text-slate-500">Upgrade plan or adjust permissions to unlock.</p>
      )}
    </article>
  );
}
