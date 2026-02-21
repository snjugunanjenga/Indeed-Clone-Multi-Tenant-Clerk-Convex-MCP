"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, Protect, UserButton } from "@clerk/nextjs";
import { BriefcaseBusiness, CreditCard, FileText, LayoutDashboard, Plus } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

const exactRoutes = new Set(["/company/jobs/new", "/company/billing"]);

const navItems = [
  { href: "/company", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/company/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/company/applications", label: "Applications", icon: FileText },
];

export default function CompanyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-2.5">
          <SiteLogo />

          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : (pathname === item.href || pathname.startsWith(item.href + "/")) &&
                  !exactRoutes.has(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}

            <Protect permission="org:job_posting:manage">
              <Link
                href="/company/jobs/new"
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/company/jobs/new"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Plus className="size-3.5" />
                Post job
              </Link>
            </Protect>

            <Protect role="org:admin">
              <Link
                href="/company/billing"
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/company/billing"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <CreditCard className="size-3.5" />
                Billing
              </Link>
            </Protect>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <OrganizationSwitcher hidePersonal />
            <UserButton />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        {children}
      </div>
    </main>
  );
}
