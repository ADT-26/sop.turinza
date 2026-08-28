"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ClienteCatalogo, Vendedor, Grupo, Burbuja, ClienteVendedor,
} from "@/lib/configStore";

// ── helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded border border-line bg-white px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-navy/40 placeholder:text-ink-muted/50";

const selectCls =
  "w-full rounded border border-line bg-white px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-navy/40";

function api(tabla: string) {
  return `/api/config/satisfaccion?tabla=${tabla}`;
}

async function cargar<T>(tabla: string): Promise<T[]> {
  const res = await fetch(api(tabla));
  const j = await res.json();
  return j.success ? j.data : [];
}

async function guardar(tabla: string, data: unknown[]): Promise<void> {
  const res = await fetch(api(tabla), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await res.json();
  if (!res.ok || !j.success) throw new Error(j.error ?? "Error al guardar");
}

// ── editor de tabla simple (nombre + id) ─────────────────────────────────────

function EditorSimple<T extends { id: number; nombre: string }>({
  tabla,
  titulo,
}: {
  tabla: string;
  titulo: string;
}) {
  const [filas, setFilas] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar<T>(tabla).then(setFilas).finally(() => setCargando(false));
  }, [tabla]);

  const actualizar = (i: number, val: string) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, nombre: val } : f)));
    setOk(false);
  };

  const agregar = () => {
    const maxId = filas.reduce((m, f) => Math.max(m, f.id), 0);
    setFilas((prev) => [...prev, { id: maxId + 1, nombre: "" } as T]);
    setOk(false);
  };

  const eliminar = (i: number) => {
    setFilas((prev) => prev.filter((_, idx) => idx !== i));
    setOk(false);
  };

  const onGuardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      const validos = filas.filter((f) => f.nombre.trim());
      await guardar(tabla, validos);
      setFilas(validos);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/30 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">{titulo}</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-ink-muted">Cargando…</td></tr>
            ) : filas.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-ink-muted">Sin registros</td></tr>
            ) : (
              filas.map((f, i) => (
                <tr key={f.id} className="group hover:bg-surface/50">
                  <td className="px-4 py-2 text-xs text-ink-muted">{i + 1}</td>
                  <td className="px-2 py-1.5 w-16 text-xs font-mono text-ink-muted">{f.id}</td>
                  <td className="px-2 py-1.5 min-w-[220px]">
                    <input className={inputCls} value={f.nombre} onChange={(e) => actualizar(i, e.target.value)} placeholder={titulo} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => eliminar(i)}
                      className="rounded-full p-1 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                    >✕</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
        <button type="button" onClick={agregar}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-navy/25 px-3 py-1.5 text-xs font-medium text-navy/60 hover:border-navy/40 hover:bg-navy/5">
          + Agregar
        </button>
        <button type="button" onClick={onGuardar} disabled={guardando}
          className="rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {ok && <span className="text-xs text-emerald-600">Guardado</span>}
        {error && <span className="text-xs text-accent">{error}</span>}
        <span className="ml-auto text-xs text-ink-muted">{filas.length} registro{filas.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

// ── editor de relaciones cliente/comercial ────────────────────────────────────

function EditorRelaciones() {
  const [relaciones, setRelaciones] = useState<ClienteVendedor[]>([]);
  const [clientes, setClientes] = useState<ClienteCatalogo[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [burbujas, setBurbujas] = useState<Burbuja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    Promise.all([
      cargar<ClienteVendedor>("cliente-vendedor"),
      cargar<ClienteCatalogo>("clientes"),
      cargar<Vendedor>("vendedores"),
      cargar<Grupo>("grupos"),
      cargar<Burbuja>("burbujas"),
    ]).then(([rel, cli, ven, gru, bur]) => {
      setRelaciones(rel);
      setClientes(cli);
      setVendedores(ven);
      setGrupos(gru);
      setBurbujas(bur);
    }).finally(() => setCargando(false));
  }, []);

  const actualizar = useCallback(<K extends keyof ClienteVendedor>(i: number, campo: K, val: ClienteVendedor[K]) => {
    setRelaciones((prev) => prev.map((r, idx) => (idx === i ? { ...r, [campo]: val } : r)));
    setOk(false);
  }, []);

  const agregar = () => {
    const maxId = relaciones.reduce((m, r) => Math.max(m, r.id), 0);
    const nueva: ClienteVendedor = {
      id: maxId + 1,
      cliente_id: clientes[0]?.id ?? 0,
      vendedor_id: vendedores[0]?.id ?? 0,
      grupo_id: null,
      servicio_id: null,
      burbuja_id: null,
      fecha_creacion: new Date().toISOString().slice(0, 10),
      ultima_actualizacion: new Date().toISOString().slice(0, 10),
      estado_operativo: "ACTIVO",
    };
    setRelaciones((prev) => [...prev, nueva]);
    setOk(false);
  };

  const eliminar = (i: number) => {
    setRelaciones((prev) => prev.filter((_, idx) => idx !== i));
    setOk(false);
  };

  const onGuardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      await guardar("cliente-vendedor", relaciones);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setGuardando(false);
    }
  };

  const nombre = (lista: { id: number; nombre?: string; razon_social?: string }[], id: number | null) =>
    id === null ? "—" : (lista.find((x) => x.id === id)?.nombre ?? lista.find((x) => x.id === id)?.razon_social ?? `#${id}`);

  const filtradas = busqueda.trim()
    ? relaciones.filter((r) => {
        const cli = clientes.find((c) => c.id === r.cliente_id)?.razon_social ?? "";
        const ven = vendedores.find((v) => v.id === r.vendedor_id)?.nombre ?? "";
        const q = busqueda.toLowerCase();
        return cli.toLowerCase().includes(q) || ven.toLowerCase().includes(q);
      })
    : relaciones;

  return (
    <div className="overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/30 bg-white shadow-sm">
      <div className="border-b border-line px-4 py-3">
        <input type="search" placeholder="Buscar por cliente o comercial…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-sm rounded border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-navy/30"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">Cliente</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">Comercial</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">Grupo</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">Burbuja</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">Estado</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-muted">Cargando…</td></tr>
            ) : filtradas.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-muted">Sin relaciones</td></tr>
            ) : (
              filtradas.map((r, i) => {
                const realIdx = relaciones.indexOf(r);
                return (
                  <tr key={r.id} className="group hover:bg-surface/50">
                    <td className="px-2 py-1.5 min-w-[200px]">
                      <select className={selectCls} value={r.cliente_id}
                        onChange={(e) => actualizar(realIdx, "cliente_id", Number(e.target.value))}>
                        {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 min-w-[160px]">
                      <select className={selectCls} value={r.vendedor_id}
                        onChange={(e) => actualizar(realIdx, "vendedor_id", Number(e.target.value))}>
                        {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 min-w-[140px]">
                      <select className={selectCls} value={r.grupo_id ?? ""}
                        onChange={(e) => actualizar(realIdx, "grupo_id", e.target.value ? Number(e.target.value) : null)}>
                        <option value="">—</option>
                        {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 min-w-[140px]">
                      <select className={selectCls} value={r.burbuja_id ?? ""}
                        onChange={(e) => actualizar(realIdx, "burbuja_id", e.target.value ? Number(e.target.value) : null)}>
                        <option value="">—</option>
                        {burbujas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 w-28">
                      <select className={selectCls} value={r.estado_operativo}
                        onChange={(e) => actualizar(realIdx, "estado_operativo", e.target.value)}>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button type="button" onClick={() => eliminar(realIdx)}
                        className="rounded-full p-1 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500">✕</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
        <button type="button" onClick={agregar}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-navy/25 px-3 py-1.5 text-xs font-medium text-navy/60 hover:border-navy/40 hover:bg-navy/5">
          + Agregar relación
        </button>
        <button type="button" onClick={onGuardar} disabled={guardando}
          className="rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          {guardando ? "Guardando…" : "Guardar relaciones"}
        </button>
        {ok && <span className="text-xs text-emerald-600">Guardado</span>}
        {error && <span className="text-xs text-accent">{error}</span>}
        <span className="ml-auto text-xs text-ink-muted">{relaciones.length} relación{relaciones.length !== 1 ? "es" : ""}</span>
      </div>
    </div>
  );
}

// ── editor de clientes (razón social + NIT) ───────────────────────────────────

function EditorClientes() {
  const [clientes, setClientes] = useState<ClienteCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar<ClienteCatalogo>("clientes").then(setClientes).finally(() => setCargando(false));
  }, []);

  const actualizar = (i: number, campo: keyof ClienteCatalogo, val: string | number) => {
    setClientes((prev) => prev.map((c, idx) => (idx === i ? { ...c, [campo]: val } : c)));
    setOk(false);
  };

  const agregar = () => {
    const maxId = clientes.reduce((m, c) => Math.max(m, c.id), 0);
    setClientes((prev) => [...prev, { id: maxId + 1, razon_social: "", nit: "" }]);
    setOk(false);
  };

  const eliminar = (i: number) => {
    setClientes((prev) => prev.filter((_, idx) => idx !== i));
    setOk(false);
  };

  const onGuardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      const validos = clientes.filter((c) => c.razon_social.trim());
      await guardar("clientes", validos);
      setClientes(validos);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = busqueda.trim()
    ? clientes.filter((c) => c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) || c.nit.includes(busqueda))
    : clientes;

  return (
    <div className="overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/30 bg-white shadow-sm">
      <div className="border-b border-line px-4 py-3">
        <input type="search" placeholder="Buscar por nombre o NIT…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-sm rounded border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-navy/30"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">ID</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">Razón social</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">NIT</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cargando ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">Cargando…</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-ink-muted">Sin registros</td></tr>
            ) : (
              filtrados.map((c, i) => {
                const realIdx = clientes.indexOf(c);
                return (
                  <tr key={c.id} className="group hover:bg-surface/50">
                    <td className="px-4 py-2 text-xs text-ink-muted">{i + 1}</td>
                    <td className="px-2 py-1.5 w-16 text-xs font-mono text-ink-muted">{c.id}</td>
                    <td className="px-2 py-1.5 min-w-[260px]">
                      <input className={inputCls} value={c.razon_social}
                        onChange={(e) => actualizar(realIdx, "razon_social", e.target.value)} placeholder="Razón social" />
                    </td>
                    <td className="px-2 py-1.5 min-w-[140px]">
                      <input className={inputCls} value={c.nit}
                        onChange={(e) => actualizar(realIdx, "nit", e.target.value)} placeholder="NIT" />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button type="button" onClick={() => eliminar(realIdx)}
                        className="rounded-full p-1 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500">✕</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
        <button type="button" onClick={agregar}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-navy/25 px-3 py-1.5 text-xs font-medium text-navy/60 hover:border-navy/40 hover:bg-navy/5">
          + Agregar cliente
        </button>
        <button type="button" onClick={onGuardar} disabled={guardando}
          className="rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          {guardando ? "Guardando…" : "Guardar clientes"}
        </button>
        {ok && <span className="text-xs text-emerald-600">Guardado</span>}
        {error && <span className="text-xs text-accent">{error}</span>}
        <span className="ml-auto text-xs text-ink-muted">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

// ── componente principal ──────────────────────────────────────────────────────

type SubTab = "relaciones" | "clientes" | "comerciales" | "grupos" | "burbujas";

const SUB_TABS: { key: SubTab; label: string; desc: string }[] = [
  { key: "relaciones",  label: "Relaciones",  desc: "Cliente / Comercial" },
  { key: "clientes",    label: "Clientes",    desc: "Razón social y NIT" },
  { key: "comerciales", label: "Comerciales", desc: "Equipo de ventas" },
  { key: "grupos",      label: "Grupos",      desc: "Grupos empresariales" },
  { key: "burbujas",    label: "Burbujas",    desc: "Burbujas operativas" },
];

export function ClientesEditor() {
  const [sub, setSub] = useState<SubTab>("relaciones");

  return (
    <section className="space-y-4">
      <header className="overflow-hidden rounded-lg border border-line bg-navy px-5 py-4 shadow-sm">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Turinza · Satisfacción
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Gestión de clientes</h2>
        <p className="mt-1 text-sm text-white/65">
          Datos compartidos con el formulario de satisfacción — los cambios se guardan directamente en el repositorio de satisfacción.
        </p>
      </header>

      {/* Sub-navegación */}
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className={`rounded-lg border px-4 py-2.5 text-left transition-all duration-150 ${
              sub === key
                ? "border-navy bg-navy text-white shadow-sm"
                : "border-line bg-white text-ink hover:border-navy/30 hover:shadow-sm"
            }`}
          >
            <p className={`text-xs font-bold ${sub === key ? "text-white" : "text-navy"}`}>{label}</p>
            <p className={`text-[11px] ${sub === key ? "text-white/60" : "text-ink-muted"}`}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Contenido */}
      {sub === "relaciones"  && <EditorRelaciones />}
      {sub === "clientes"    && <EditorClientes />}
      {sub === "comerciales" && <EditorSimple<Vendedor> tabla="vendedores" titulo="Nombre comercial" />}
      {sub === "grupos"      && <EditorSimple<Grupo>    tabla="grupos"     titulo="Nombre del grupo" />}
      {sub === "burbujas"    && <EditorSimple<Burbuja>  tabla="burbujas"   titulo="Nombre de burbuja" />}
    </section>
  );
}
