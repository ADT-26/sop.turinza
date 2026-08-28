"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui";
import type { SopResumen } from "@/lib/sopStore";
import type { DashboardRole } from "@/proxy";
import { EliminarSopButton } from "@/components/dashboard/EliminarSopButton";
import { EquipoTurinzaEditor } from "@/components/dashboard/EquipoTurinzaEditor";
import { ConfigDocumentoEditor } from "@/components/dashboard/ConfigDocumentoEditor";
import { ClientesEditor } from "@/components/dashboard/ClientesEditor";
import type { ClientesSubTab } from "@/components/dashboard/ClientesEditor";
import { IndicadoresPanel } from "@/components/dashboard/IndicadoresPanel";

type View =
  | "sops"
  | "indicadores"
  | "equipo"
  | "config"
  | "clientes_relaciones"
  | "clientes_lista"
  | "clientes_comerciales"
  | "clientes_grupos"
  | "clientes_burbujas";

const VIEW_META: Record<View, { label: string; subtitle: string }> = {
  sops:                 { label: "SOPs recibidos",                  subtitle: "Formularios enviados por el equipo comercial" },
  indicadores:          { label: "Indicadores",                     subtitle: "Participación, cobertura y tendencia de SOPs" },
  equipo:               { label: "Equipo Turinza",                  subtitle: "Gestión comerciales · Directorio interno" },
  config:               { label: "Datos generales",                 subtitle: "Código, versión y vigencia del documento SOP" },
  clientes_relaciones:  { label: "Relaciones cliente / comercial",  subtitle: "Vínculos entre clientes, comerciales, grupos y burbujas" },
  clientes_lista:       { label: "Catálogo de clientes",           subtitle: "Razón social y NIT" },
  clientes_comerciales: { label: "Comerciales",                    subtitle: "Equipo de ventas y ejecutivos de cuenta" },
  clientes_grupos:      { label: "Grupos empresariales",           subtitle: "Agrupaciones de clientes" },
  clientes_burbujas:    { label: "Burbujas operativas",            subtitle: "Unidades de operación" },
};

const CLIENTES_VIEW_MAP: Partial<Record<View, ClientesSubTab>> = {
  clientes_relaciones:  "relaciones",
  clientes_lista:       "clientes",
  clientes_comerciales: "comerciales",
  clientes_grupos:      "grupos",
  clientes_burbujas:    "burbujas",
};

// ── SOPs panel ────────────────────────────────────────────────────────────────

function PendienteDot({ sop }: { sop: SopResumen }) {
  if (sop.nivelCliente) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      Pendiente
    </span>
  );
}

function PanelSops({ sops, error }: { sops: SopResumen[]; error: string | null }) {
  if (error) {
    return <p className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-sm text-accent">{error}</p>;
  }
  if (sops.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-sm text-ink-muted">
        Todavía no hay SOPs guardados.
      </p>
    );
  }
  return (
    <>
      {/* Cards: narrow screens */}
      <ul className="space-y-3 md:hidden">
        {sops.map((sop) => (
          <li key={sop.id} className="rounded-md border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/dashboard/${sop.id}`} className="font-semibold text-navy hover:underline">
                {sop.cliente}
              </Link>
              <div className="flex items-center gap-2">
                <PendienteDot sop={sop} />
                <Badge>{sop.estado}</Badge>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-muted">
              <div><dt className="text-[10px] uppercase">NIT</dt><dd className="font-mono text-ink">{sop.nit}</dd></div>
              <div><dt className="text-[10px] uppercase">Tipo operación</dt><dd className="text-ink">{sop.tipoOperacion}</dd></div>
              <div><dt className="text-[10px] uppercase">Nivel</dt><dd className="text-ink">{sop.nivelCliente}</dd></div>
              <div><dt className="text-[10px] uppercase">Fecha</dt><dd className="font-mono text-ink">{new Date(sop.createdAt).toLocaleString("es-CO")}</dd></div>
            </dl>
            <div className="mt-3 border-t border-line pt-3">
              <EliminarSopButton id={sop.id} cliente={sop.cliente} />
            </div>
          </li>
        ))}
      </ul>

      {/* Table: medium screens + */}
      <div className="hidden overflow-hidden rounded-lg border border-line bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy font-mono text-[11px] uppercase tracking-wide text-white/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">NIT</th>
              <th className="px-4 py-3 font-semibold">Tipo operación</th>
              <th className="px-4 py-3 font-semibold">Nivel</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sops.map((sop) => (
              <tr key={sop.id} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/${sop.id}`} className="font-semibold text-navy hover:underline">
                    {sop.cliente}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">{sop.nit}</td>
                <td className="px-4 py-3 text-ink-muted">{sop.tipoOperacion}</td>
                <td className="px-4 py-3 text-ink-muted">{sop.nivelCliente || <PendienteDot sop={sop} />}</td>
                <td className="px-4 py-3"><Badge>{sop.estado}</Badge></td>
                <td className="px-4 py-3 font-mono text-ink-muted">{new Date(sop.createdAt).toLocaleString("es-CO")}</td>
                <td className="px-4 py-3"><EliminarSopButton id={sop.id} cliente={sop.cliente} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function DashboardContent({
  sops,
  error,
  role,
}: {
  sops: SopResumen[];
  error: string | null;
  role: DashboardRole;
}) {
  const searchParams = useSearchParams();
  const rawSection = searchParams.get("s") ?? "sops";

  // Viewer solo puede ver SOPs — protección adicional en cliente
  const view: View = role === "viewer"
    ? "sops"
    : (Object.keys(VIEW_META).includes(rawSection) ? rawSection as View : "sops");

  const meta = VIEW_META[view];
  const clientesSubTab = CLIENTES_VIEW_MAP[view];

  return (
    <>
      {/* Topbar */}
      <div className="flex items-center gap-3 border-b border-line/60 bg-white px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold leading-tight text-navy">{meta.label}</h2>
          <p className="truncate text-xs text-ink-muted">{meta.subtitle}</p>
        </div>
        {view === "sops" && (
          <span className="flex-shrink-0 rounded-full bg-navy/8 px-2.5 py-0.5 font-mono text-xs font-semibold text-navy/70">
            {sops.length} registro{sops.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Panel */}
      <div className="p-5">
        {view === "sops" && <PanelSops sops={sops} error={error} />}
        {view === "indicadores" && <IndicadoresPanel />}
        {view === "equipo" && <EquipoTurinzaEditor />}
        {view === "config" && <ConfigDocumentoEditor />}
        {clientesSubTab && <ClientesEditor subTab={clientesSubTab} />}
      </div>
    </>
  );
}
