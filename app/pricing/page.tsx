import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-6 py-12">
      <h1 className="text-3xl font-semibold">Company plans</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Select a plan for your organization. Billing for this app is organization-based.
      </p>
      <div className="rounded-lg border p-4">
        <PricingTable for="organization" />
      </div>
    </main>
  );
}
