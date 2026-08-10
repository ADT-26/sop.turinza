"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import type { SopResumen } from "@/lib/sopStore";
import { EliminarSopButton } from "@/components/dashboard/EliminarSopButton";
import { EquipoTurinzaEditor } from "@/components/dashboard/EquipoTurinzaEditor";

type Tab = "sops" | "equipo";

function PendienteDot({ sop }: { sop: SopResumen }) {
  if (sop.nivelCliente) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent"
      title="Falta asignar el Nivel Cliente"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      Pendiente
    </span>
  );
}

export function DashboardTabs({
  sops,
  error,
}: {
  sops: SopResumen[];
  error: string | null;
}) {
  const [tab, setTab] = useState<Tab>("sops");

  return (
    <div className="space-y-5">
      {/* ── Navegación ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <button
          onClick={() => setTab("sops")}
          className={`rounded-xl border px-5 py-4 text-left transition-all duration-150 ${
            tab === "sops"
              ? "border-navy bg-navy shadow-md"
              : "border-line bg-white shadow-sm hover:border-navy/30 hover:shadow"
          }`}
        >
          <p
            className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${
              tab === "sops" ? "text-white/50" : "text-navy/40"
            }`}
          >
            Formularios
          </p>
          <p
            className={`mt-1 text-sm font-bold tracking-tight ${
              tab === "sops" ? "text-white" : "text-navy"
            }`}
          >
            SOPs recibidos
          </p>
          <p
            className={`mt-0.5 font-mono text-xs tabular-nums ${
              tab === "sops" ? "text-white/55" : "text-ink-muted"
            }`}
          >
            {sops.length} registro{sops.length !== 1 ? "s" : ""}
          </p>
        </button>

        <button
          onClick={() => setTab("equipo")}
          className={`rounded-xl border px-5 py-4 text-left transition-all duration-150 ${
            tab === "equipo"
              ? "border-navy bg-navy shadow-md"
              : "border-line bg-white shadow-sm hover:border-navy/30 hover:shadow"
          }`}
        >
          <p
            className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${
              tab === "equipo" ? "text-white/50" : "text-navy/40"
            }`}
          >
            Directorio
          </p>
          <p
            className={`mt-1 text-sm font-bold tracking-tight ${
              tab === "equipo" ? "text-white" : "text-navy"
            }`}
          >
            Gestión comerciales
          </p>
          <p
            className={`mt-0.5 font-mono text-xs tabular-nums ${
              tab === "equipo" ? "text-white/55" : "text-ink-muted"
            }`}
          >
            Equipo Turinza
          </p>
        </button>
      </div>

      {/* ── Panel SOPs ───────────────────────────────────────── */}
      {tab === "sops" && (
        <div>
          {error ? (
            <p className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-sm text-accent">
              {error}
            </p>
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
                        className="font-semibold text-navy hover:underline"
                      >
                        {sop.cliente}
                      </Link>
                      <div className="flex items-center gap-2">
                        <PendienteDot sop={sop} />
                        <Badge>{sop.estado}</Badge>
                      </div>
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
                    <div className="mt-3 border-t border-line pt-3">
                      <EliminarSopButton id={sop.id} cliente={sop.cliente} />
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tabla: pantallas medianas en adelante */}
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
                          <Link
                            href={`/dashboard/${sop.id}`}
                            className="font-semibold text-navy hover:underline"
                          >
                            {sop.cliente}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-ink-muted">{sop.nit}</td>
                        <td className="px-4 py-3 text-ink-muted">{sop.tipoOperacion}</td>
                        <td className="px-4 py-3 text-ink-muted">
                          {sop.nivelCliente || <PendienteDot sop={sop} />}
                        </td>
                        <td className="px-4 py-3">
                          <Badge>{sop.estado}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-ink-muted">
                          {new Date(sop.createdAt).toLocaleString("es-CO")}
                        </td>
                        <td className="px-4 py-3">
                          <EliminarSopButton id={sop.id} cliente={sop.cliente} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Panel Equipo ─────────────────────────────────────── */}
      {tab === "equipo" && <EquipoTurinzaEditor />}
    </div>
  );
}
