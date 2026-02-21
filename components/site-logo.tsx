import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex size-7 items-center justify-center rounded-lg bg-terracotta text-white">
        <BriefcaseBusiness className="size-3.5" />
      </div>
      <span className="font-[family-name:var(--font-bricolage)] text-base font-bold tracking-tight">
        Jobly
      </span>
    </Link>
  );
}
