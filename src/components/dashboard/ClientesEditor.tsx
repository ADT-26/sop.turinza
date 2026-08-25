"use client";

import { useEffect, useState } from "react";
import type { ClienteCatalogo } from "@/lib/configStore";

const VACIO: ClienteCatalogo = { id: 0, razon_social: "", nit: "" };

const inputCls =
  "w-full rounded border border-line bg-white px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-navy/40 placeholder:text-ink-muted/50";

export function ClientesEditor() {
  const [clientes, setClientes] = useState<ClienteCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/config/clientes")
      .then((r) => r.json())
      .then((j) => { if (j.success) setClientes(j.data); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const actualizar = (i: number, campo: keyof ClienteCatalogo, val: string | number) => {
    setClientes((prev) => prev.map((c, idx) => (idx === i ? { ...c, [campo]: val } : c)));
    setOk(false);
  };

  const agregar = () => {
    const maxId = clientes.reduce((m, c) => Math.max(m, c.id), 0);
    setClientes((prev) => [...prev, { ...VACIO, id: maxId + 1 }]);
    setOk(false);
  };

  const eliminar = (i: number) => {
    setClientes((prev) => prev.filter((_, idx) => idx !== i));
    setOk(false);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      const validos = clientes.filter((c) => c.razon_social.trim());
      const res = await fetch("/api/config/clientes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validos),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al guardar");
      setClientes(validos);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = busqueda.trim()
    ? clientes.filter(
        (c) =>
          c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.nit.includes(busqueda),
      )
    : clientes;

  return (
    <section className="overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/30 bg-white shadow-sm">
      <header className="bg-navy px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Turinza · Clientes
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Catálogo de clientes</h2>
        <p className="mt-1 text-sm text-white/65">
          Directorio compartido con el formulario de satisfacción. Los datos se guardan en el repositorio{" "}
          <code className="rounded bg-white/10 px-1 font-mono text-xs">data</code>.
        </p>
      </header>

      <div className="border-b border-line px-5 py-3">
        <input
          type="search"
          placeholder="Buscar por nombre o NIT…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-sm rounded border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-navy/30"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Razón social</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">NIT</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">Cargando…</td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">
                  {busqueda ? "Sin resultados para esa búsqueda" : "No hay clientes registrados"}
                </td>
              </tr>
            ) : (
              filtrados.map((c, i) => {
                const realIdx = clientes.indexOf(c);
                return (
                  <tr key={c.id} className="group hover:bg-surface/50">
                    <td className="px-4 py-2 text-xs text-ink-muted">{i + 1}</td>
                    <td className="px-2 py-1.5 w-16">
                      <input
                        className={inputCls}
                        type="number"
                        value={c.id}
                        onChange={(e) => actualizar(realIdx, "id", Number(e.target.value))}
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-2 py-1.5 min-w-[260px]">
                      <input
                        className={inputCls}
                        value={c.razon_social}
                        onChange={(e) => actualizar(realIdx, "razon_social", e.target.value)}
                        placeholder="Razón social"
                      />
                    </td>
                    <td className="px-2 py-1.5 min-w-[140px]">
                      <input
                        className={inputCls}
                        value={c.nit}
                        onChange={(e) => actualizar(realIdx, "nit", e.target.value)}
                        placeholder="NIT"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => eliminar(realIdx)}
                        aria-label={`Eliminar ${c.razon_social}`}
                        className="rounded-full p-1 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
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
          <span aria-hidden="true">+</span> Agregar cliente
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar catálogo"}
        </button>
        {ok && !guardando && <span className="text-xs text-emerald-600">Catálogo guardado correctamente</span>}
        {error && <span role="alert" className="text-xs text-accent">{error}</span>}
        <span className="ml-auto text-xs text-ink-muted">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</span>
      </div>
    </section>
  );
}
