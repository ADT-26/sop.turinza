import Link from "next/link";
import { Badge } from "@/components/ui";
import { listarSops, type SopResumen } from "@/lib/sopStore";

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
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary-dark">
          Panel interno
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">SOPs recibidos</h1>
        <p className="mt-1 text-sm text-ink-muted">{sops.length} registro(s)</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-sm text-accent">{error}</p>
      ) : sops.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
          Todavía no hay SOPs guardados.
        </p>
      ) : (
        <>
          {/* Tarjetas: pantallas angostas */}
          <ul className="space-y-3 md:hidden">
            {sops.map((sop) => (
              <li key={sop.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/dashboard/${sop.id}`}
                    className="font-medium text-primary-dark hover:underline"
                  >
                    {sop.cliente}
                  </Link>
                  <Badge>{sop.estado}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-muted">
                  <div>
                    <dt className="text-[10px] uppercase">NIT</dt>
                    <dd className="font-mono text-ink">{sop.nit}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase">Tipo operación</dt>
                    <dd className="text-ink">{sop.tipoOperacion}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase">Nivel</dt>
                    <dd className="text-ink">{sop.nivelCliente}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase">Fecha</dt>
                    <dd className="font-mono text-ink">
                      {new Date(sop.createdAt).toLocaleString("es-CO")}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          {/* Tabla: pantallas medianas en adelante */}
          <div className="hidden overflow-hidden rounded-md border border-line bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">NIT</th>
                  <th className="px-4 py-3">Tipo operación</th>
                  <th className="px-4 py-3">Nivel</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sops.map((sop) => (
                  <tr key={sop.id} className="hover:bg-surface">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/${sop.id}`}
                        className="font-medium text-primary-dark hover:underline"
                      >
                        {sop.cliente}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-muted">{sop.nit}</td>
                    <td className="px-4 py-3 text-ink-muted">{sop.tipoOperacion}</td>
                    <td className="px-4 py-3 text-ink-muted">{sop.nivelCliente}</td>
                    <td className="px-4 py-3">
                      <Badge>{sop.estado}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-muted">
                      {new Date(sop.createdAt).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
