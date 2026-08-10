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
    <div className="min-h-screen bg-[#EEF1F6]">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-navy/40">
            Panel interno · Turinza
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy">Panel de gestión</h1>
        </div>

        <DashboardTabs sops={sops} error={error} />
      </div>
    </div>
  );
}
