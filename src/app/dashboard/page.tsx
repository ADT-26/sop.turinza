import { headers } from "next/headers";
import { listarSops, type SopResumen } from "@/lib/sopStore";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import type { DashboardRole } from "@/proxy";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let sops: SopResumen[] = [];
  let error: string | null = null;

  try {
    sops = await listarSops(100, 0);
  } catch {
    error = "No se pudo conectar con el almacén de formularios. Revisa las variables GITHUB_*.";
  }

  const headersList = await headers();
  const role = (headersList.get("x-dashboard-role") ?? "viewer") as DashboardRole;

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTabs sops={sops} error={error} role={role} />
    </div>
  );
}
