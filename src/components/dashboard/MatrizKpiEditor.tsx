"use client";

import { useState } from "react";
import {
  OPCIONES_SERVICIOS,
  OPCIONES_FRECUENCIA_LARGA,
  OPCIONES_CARGOS_RESPONSABLE,
} from "@/lib/options";
import type { KpiCliente } from "@/lib/schemas";

const KPI_VACIO: KpiCliente = {
  servicio: "",
  indicador: "",
  descripcion: "",
  meta: "",
  frecuencia: "",
  fuente: "",
  responsable: "",
  observaciones: "",
};

function FilaKpi({
  fila,
  index,
  onCambio,
  onEliminar,
  mostrarEliminar,
}: {
  fila: KpiCliente;
  index: number;
  onCambio: (index: number, campo: keyof KpiCliente, valor: string) => void;
  onEliminar: (index: number) => void;
  mostrarEliminar: boolean;
}) {
  const campo = (k: keyof KpiCliente) => fila[k] as string;
  const set = (k: keyof KpiCliente) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onCambio(index, k, e.target.value);

  return (
    <div className="relative rounded-lg border border-line bg-white p-4">
      {mostrarEliminar && (
        <button
          type="button"
          onClick={() => onEliminar(index)}
          aria-label="Eliminar KPI"
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs text-ink-muted hover:bg-red-50 hover:text-red-500"
        >
          ✕
        </button>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Servicio</label>
          <select
            value={campo("servicio")}
            onChange={set("servicio")}
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Selecciona —</option>
            {OPCIONES_SERVICIOS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Indicador *</label>
          <input
            type="text"
            value={campo("indicador")}
            onChange={set("indicador")}
            placeholder="Ej: % entregas a tiempo"
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Frecuencia</label>
          <select
            value={campo("frecuencia")}
            onChange={set("frecuencia")}
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Selecciona —</option>
            {OPCIONES_FRECUENCIA_LARGA.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Responsable</label>
          <select
            value={campo("responsable")}
            onChange={set("responsable")}
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Selecciona —</option>
            {OPCIONES_CARGOS_RESPONSABLE.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Descripción</label>
          <input
            type="text"
            value={campo("descripcion")}
            onChange={set("descripcion")}
            placeholder="Descripción del indicador"
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Meta</label>
          <input
            type="text"
            value={campo("meta")}
            onChange={set("meta")}
            placeholder="Ej: ≥ 95%"
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Fuente</label>
          <input
            type="text"
            value={campo("fuente")}
            onChange={set("fuente")}
            placeholder="Ej: Odoo / reporte mensual"
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Observaciones</label>
          <input
            type="text"
            value={campo("observaciones")}
            onChange={set("observaciones")}
            placeholder="Notas adicionales"
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}

export function MatrizKpiEditor({
  id,
  valorInicial,
}: {
  id: string;
  valorInicial: KpiCliente[];
}) {
  const [filas, setFilas] = useState<KpiCliente[]>(valorInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualizar = (index: number, campo: keyof KpiCliente, valor: string) => {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, [campo]: valor } : f)));
    setGuardadoOk(false);
  };

  const agregar = () => {
    setFilas((prev) => [...prev, { ...KPI_VACIO }]);
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
        body: JSON.stringify({ matrizKpi: filas }),
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
    <section className="overflow-hidden rounded-lg border border-line border-l-4 border-l-navy/30 bg-white shadow-sm">
      <header className="bg-navy px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Turinza · Indicadores
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Matriz KPI del cliente</h2>
        <p className="mt-1 text-sm text-white/65">
          Indicadores de desempeño acordados con el cliente. Se exportan a la hoja "Matriz KPI" del Excel.
        </p>
      </header>

      <div className="space-y-3 p-5">
        {filas.length === 0 && (
          <p className="text-sm text-ink-muted">No hay KPIs registrados aún.</p>
        )}
        {filas.map((fila, i) => (
          <FilaKpi
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
            <span aria-hidden="true">+</span> Agregar KPI
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar matriz"}
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
