"use client";

import { useEffect, useState } from "react";
import { TextInput } from "@/components/ui";
import type { MiembroEquipo } from "@/lib/configStore";
import { EQUIPO_FALLBACK } from "@/components/dashboard/AutocompleteInput";

const VACIO: MiembroEquipo = { nombre: "", cargo: "", correo: "", telefono: "" };

const inputCls =
  "w-full rounded border border-line bg-white px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-navy/40 placeholder:text-ink-muted/50";

export function EquipoTurinzaEditor() {
  const [miembros, setMiembros] = useState<MiembroEquipo[]>(EQUIPO_FALLBACK);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config/equipo")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data) && j.data.length > 0) setMiembros(j.data);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const actualizar = (i: number, campo: keyof MiembroEquipo, val: string) => {
    setMiembros((prev) => prev.map((m, idx) => (idx === i ? { ...m, [campo]: val } : m)));
    setOk(false);
  };

  const agregar = () => {
    setMiembros((prev) => [...prev, { ...VACIO }]);
    setOk(false);
  };

  const eliminar = (i: number) => {
    setMiembros((prev) => prev.filter((_, idx) => idx !== i));
    setOk(false);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      const validos = miembros.filter((m) => m.nombre.trim());
      const res = await fetch("/api/config/equipo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validos),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al guardar");
      setMiembros(validos);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section id="equipo" className="overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/30 bg-white shadow-sm">
      <header className="bg-navy px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Turinza · Configuración
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Equipo Turinza</h2>
        <p className="mt-1 text-sm text-white/65">
          Directorio interno usado en el autocompletado de contactos al diligenciar SOPs.
          Los datos se guardan en la rama <code className="rounded bg-white/10 px-1 font-mono text-xs">data</code> del repositorio.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Nombre</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Cargo</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Correo</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Teléfono</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">
                  Cargando…
                </td>
              </tr>
            ) : (
              miembros.map((m, i) => (
                <tr key={i} className="group hover:bg-surface/50">
                  <td className="px-4 py-2 text-xs text-ink-muted">{i + 1}</td>
                  <td className="px-2 py-1.5 min-w-[200px]">
                    <input
                      className={inputCls}
                      value={m.nombre}
                      onChange={(e) => actualizar(i, "nombre", e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </td>
                  <td className="px-2 py-1.5 min-w-[160px]">
                    <input
                      className={inputCls}
                      value={m.cargo}
                      onChange={(e) => actualizar(i, "cargo", e.target.value)}
                      placeholder="Cargo"
                    />
                  </td>
                  <td className="px-2 py-1.5 min-w-[200px]">
                    <input
                      className={inputCls}
                      value={m.correo}
                      onChange={(e) => actualizar(i, "correo", e.target.value)}
                      placeholder="correo@turinza.com"
                      type="email"
                    />
                  </td>
                  <td className="px-2 py-1.5 min-w-[120px]">
                    <input
                      className={inputCls}
                      value={m.telefono}
                      onChange={(e) => actualizar(i, "telefono", e.target.value)}
                      placeholder="310…"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => eliminar(i)}
                      aria-label={`Eliminar ${m.nombre}`}
                      className="rounded-full p-1 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
        <button
          type="button"
          onClick={agregar}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-navy/25 px-3 py-2 text-xs font-medium text-navy/60 hover:border-navy/40 hover:bg-navy/5"
        >
          <span aria-hidden="true">+</span> Agregar persona
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar directorio"}
        </button>
        {ok && !guardando && (
          <span className="text-xs text-emerald-600">Directorio guardado correctamente</span>
        )}
        {error && (
          <span role="alert" className="text-xs text-accent">{error}</span>
        )}
        <span className="ml-auto text-xs text-ink-muted">{miembros.length} persona(s)</span>
      </div>
    </section>
  );
}
