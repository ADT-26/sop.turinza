import { listarSops, type SopResumen } from "@/lib/sopStore";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let sops: SopResumen[] = [];
  let error: string | null = null;

  try {
    sops = await listarSops(100, 0);
  } catch {
    error = "No se pudo conectar con el almacén de formularios. Revisa las variables GITHUB_*.";
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTabs sops={sops} error={error} />
    </div>
  );
}
