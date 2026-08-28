"use client";

import { useEffect, useState } from "react";
import type { ConfigDocumento } from "@/lib/configStore";

const DEFAULT: ConfigDocumento = {
  codigoDocumento: "OP-F02",
  version: "01",
  vigencia: "junio de 2026",
  tipoDocumento: "Doc. controlado",
};

const inputCls =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-navy/40 placeholder:text-ink-muted/50";

export function ConfigDocumentoEditor() {
  const [cfg, setCfg] = useState<ConfigDocumento>(DEFAULT);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config/documento")
      .then((r) => r.json())
      .then((j) => { if (j.success && j.data) setCfg(j.data); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const set = (k: keyof ConfigDocumento) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCfg((c) => ({ ...c, [k]: e.target.value }));
    setOk(false);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/config/documento", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al guardar");
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-line border-l-4 border-l-primary bg-white shadow-sm">
      <header className="bg-primary-dark px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Turinza · Configuración
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Metadatos del documento</h2>
        <p className="mt-1 text-sm text-white/65">
          Código, versión y vigencia que aparecen en el encabezado del PDF y en el header de la aplicación.
        </p>
      </header>

      <div className="p-5">
        {cargando ? (
          <p className="text-sm text-ink-muted">Cargando…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-muted">Tipo de documento</label>
              <input className={inputCls} value={cfg.tipoDocumento} onChange={set("tipoDocumento")} placeholder="Doc. controlado" />
              <p className="text-[11px] text-ink-muted/60">Etiqueta que precede al código en el header web</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-muted">Código del documento</label>
              <input className={inputCls} value={cfg.codigoDocumento} onChange={set("codigoDocumento")} placeholder="OP-F02" />
              <p className="text-[11px] text-ink-muted/60">Se muestra en el encabezado del PDF y del web</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-muted">Versión</label>
              <input className={inputCls} value={cfg.version} onChange={set("version")} placeholder="01" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-muted">Vigencia</label>
              <input className={inputCls} value={cfg.vigencia} onChange={set("vigencia")} placeholder="junio de 2026" />
              <p className="text-[11px] text-ink-muted/60">Aparece en el encabezado del PDF</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {!cargando && (
          <div className="mt-5 rounded-md border border-line bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted/60">
              Vista previa — header web
            </p>
            <div className="inline-flex items-center gap-2 rounded border border-primary-dark/25 bg-primary-dark px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {cfg.tipoDocumento} · {cfg.codigoDocumento} · v.{cfg.version}
            </div>
            <p className="mt-3 mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted/60">
              Vista previa — encabezado PDF
            </p>
            <p className="font-mono text-xs text-ink">
              SOP DE CLIENTE LOGÍSTICO / {cfg.codigoDocumento} &nbsp;·&nbsp; Versión: {cfg.version} / Vigencia: {cfg.vigencia}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || cargando}
          className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
        {ok && !guardando && (
          <span className="text-xs text-emerald-600">Guardado — los cambios se verán al redesplegar</span>
        )}
        {error && <span role="alert" className="text-xs text-accent">{error}</span>}
      </div>
    </section>
  );
}
