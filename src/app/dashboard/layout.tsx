import { Suspense } from "react";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardRole } from "@/proxy";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const role = (headersList.get("x-dashboard-role") ?? "viewer") as DashboardRole;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<div className="flex-1 bg-surface" />}>
        <DashboardShell role={role}>
          {children}
        </DashboardShell>
      </Suspense>
    </div>
  );
}
