"use client";

import { useState } from "react";
import { OPCIONES_CARGOS_RESPONSABLE, OPCIONES_ESTADO_DOCUMENTO } from "@/lib/options";
import type { CambioControl } from "@/lib/schemas";

type Cambio = CambioControl;

const CAMBIO_VACIO: Cambio = {
  version: "",
  fecha: "",
  seccionModificada: "",
  descripcionCambio: "",
  motivo: "",
  solicitadoPor: "",
  responsable: "",
  aprobadoPor: "",
  estado: "",
};

function FilaCambio({
  fila,
  index,
  onCambio,
  onEliminar,
  mostrarEliminar,
}: {
  fila: Cambio;
  index: number;
  onCambio: (index: number, campo: keyof Cambio, valor: string) => void;
  onEliminar: (index: number) => void;
  mostrarEliminar: boolean;
}) {
  const v = (k: keyof Cambio) => (fila[k] ?? "") as string;
  const set = (k: keyof Cambio) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onCambio(index, k, e.target.value);

  const inputCls = "rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-primary";
  const selectCls = inputCls;
  const labelCls = "text-xs text-ink-muted";

  return (
    <div className="relative rounded-lg border border-line bg-white p-4">
      {mostrarEliminar && (
        <button
          type="button"
          onClick={() => onEliminar(index)}
          aria-label="Eliminar cambio"
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs text-ink-muted hover:bg-red-50 hover:text-red-500"
        >
          ✕
        </button>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Versión *</label>
          <input type="text" value={v("version")} onChange={set("version")} placeholder="Ej: 02" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Fecha *</label>
          <input type="date" value={v("fecha")} onChange={set("fecha")} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Estado *</label>
          <select value={v("estado")} onChange={set("estado")} className={selectCls}>
            <option value="">— Selecciona —</option>
            {OPCIONES_ESTADO_DOCUMENTO.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Sección modificada *</label>
          <input type="text" value={v("seccionModificada")} onChange={set("seccionModificada")} placeholder="Ej: 3. Matriz de contactos" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Solicitado por</label>
          <input type="text" value={v("solicitadoPor")} onChange={set("solicitadoPor")} placeholder="Nombre o cargo" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Responsable *</label>
          <select value={v("responsable")} onChange={set("responsable")} className={selectCls}>
            <option value="">— Selecciona —</option>
            {OPCIONES_CARGOS_RESPONSABLE.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label className={labelCls}>Descripción del cambio *</label>
          <textarea
            value={v("descripcionCambio")}
            onChange={set("descripcionCambio")}
            placeholder="Describir qué se modificó y cómo"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-1">
          <label className={labelCls}>Motivo</label>
          <input type="text" value={v("motivo")} onChange={set("motivo")} placeholder="Razón del cambio" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-1">
          <label className={labelCls}>Aprobado por</label>
          <input type="text" value={v("aprobadoPor")} onChange={set("aprobadoPor")} placeholder="Nombre o cargo" className={inputCls} />
        </div>
      </div>
    </div>
  );
}

export function ControlCambiosEditor({
  id,
  valorInicial,
}: {
  id: string;
  valorInicial: CambioControl[];
}) {
  const [filas, setFilas] = useState<CambioControl[]>(valorInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualizar = (index: number, campo: keyof Cambio, valor: string) => {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, [campo]: valor } : f)));
    setGuardadoOk(false);
  };

  const agregar = () => {
    setFilas((prev) => [...prev, { ...CAMBIO_VACIO }]);
    setGuardadoOk(false);
  };

  const eliminar = (index: number) => {
    setFilas((prev) => prev.filter((_, i) => i !== index));
    setGuardadoOk(false);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setGuardadoOk(false);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ controlCambios: filas }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al guardar");
      setGuardadoOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-line border-l-4 border-l-primary bg-white shadow-sm">
      <header className="bg-primary-dark px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/60">
          Turinza · Trazabilidad
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Control de cambios</h2>
        <p className="mt-1 text-sm text-white/65">
          Registro de modificaciones al SOP. Se exporta a la hoja "Control de Cambios" del Excel.
        </p>
      </header>

      <div className="space-y-3 p-5">
        {filas.length === 0 && (
          <p className="text-sm text-ink-muted">No hay cambios registrados aún.</p>
        )}
        {filas.map((fila, i) => (
          <FilaCambio
            key={i}
            fila={fila}
            index={i}
            onCambio={actualizar}
            onEliminar={eliminar}
            mostrarEliminar={filas.length > 0}
          />
        ))}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={agregar}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-navy/25 px-3 py-2 text-xs font-medium text-navy/60 hover:border-navy/40 hover:bg-navy/5"
          >
            <span aria-hidden="true">+</span> Registrar cambio
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          {guardadoOk && !guardando && (
            <span className="text-xs text-emerald-600">Guardado correctamente</span>
          )}
          {error && (
            <span role="alert" className="text-xs text-accent">{error}</span>
          )}
        </div>
      </div>
    </section>
  );
}
