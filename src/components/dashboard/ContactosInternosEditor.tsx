"use client";

import { useEffect, useState } from "react";
import { TextInput } from "@/components/ui";
import { AREAS_CONTACTO_INTERNOS, type TablaContactosInternos } from "@/lib/schemas";
import type { MiembroEquipo } from "@/lib/configStore";
import { AutocompleteInput, EQUIPO_FALLBACK } from "@/components/dashboard/AutocompleteInput";

export function ContactosInternosEditor({
  id,
  valorInicial,
}: {
  id: string;
  valorInicial: TablaContactosInternos;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipo, setEquipo] = useState<MiembroEquipo[]>(EQUIPO_FALLBACK);

  useEffect(() => {
    fetch("/api/config/equipo")
      .then((r) => r.json())
      .then((j) => { if (j.success && Array.isArray(j.data) && j.data.length > 0) setEquipo(j.data); })
      .catch(() => {});
  }, []);

  function seleccionarMiembro(index: number, m: MiembroEquipo) {
    setValor((v) => {
      const departamentos = [...v.departamentos];
      departamentos[index] = { ...departamentos[index], nombreCargo: m.nombre, correo: m.correo, telefono: m.telefono };
      return { ...v, departamentos };
    });
  }

  function actualizarDep(index: number, campo: "nombreCargo" | "correo" | "telefono" | "backup", val: string) {
    setValor((v) => {
      const departamentos = [...v.departamentos];
      departamentos[index] = { ...departamentos[index], [campo]: val };
      return { ...v, departamentos };
    });
  }

  function actualizarEsc(index: number, campo: "nombreCargo" | "correo" | "telefono", val: string) {
    setValor((v) => {
      const departamentos = [...v.departamentos];
      departamentos[index] = {
        ...departamentos[index],
        escalonamiento: { ...departamentos[index].escalonamiento, [campo]: val },
      };
      return { ...v, departamentos };
    });
  }

  function seleccionarEscMiembro(index: number, m: MiembroEquipo) {
    setValor((v) => {
      const departamentos = [...v.departamentos];
      departamentos[index] = {
        ...departamentos[index],
        escalonamiento: { nombreCargo: m.nombre, correo: m.correo, telefono: m.telefono },
      };
      return { ...v, departamentos };
    });
  }

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setGuardadoOk(false);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactosInternos: valor }),
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
    <div className="space-y-3">
      {AREAS_CONTACTO_INTERNOS.map((area, index) => {
        const dep = valor.departamentos[index];
        return (
          <div key={area} className="rounded-lg border border-line bg-white">
            <p className="px-4 pt-3 pb-2 text-sm font-semibold text-navy">{area}</p>
            <div className="px-4 pb-3 grid gap-3 sm:grid-cols-2">
              <AutocompleteInput
                value={dep.nombreCargo}
                onChange={(v) => {
                  if (!v) seleccionarMiembro(index, { nombre: "", correo: "", telefono: "" });
                  else actualizarDep(index, "nombreCargo", v);
                }}
                onSeleccionar={(m) => seleccionarMiembro(index, m)}
                opciones={equipo}
              />
              <TextInput
                placeholder="Teléfono"
                value={dep.telefono}
                onChange={(e) => actualizarDep(index, "telefono", e.target.value)}
              />
              <TextInput
                placeholder="Correo"
                value={dep.correo}
                onChange={(e) => actualizarDep(index, "correo", e.target.value)}
              />
              <AutocompleteInput
                value={dep.backup}
                onChange={(v) => actualizarDep(index, "backup", v)}
                onSeleccionar={(m) => actualizarDep(index, "backup", m.correo || m.nombre)}
                opciones={equipo}
                placeholder="Backup (busca por nombre)"
              />
            </div>
            <div className="border-t border-line/60 bg-surface px-4 py-3 rounded-b-lg">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/60">Escalonamiento</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <AutocompleteInput
                  value={dep.escalonamiento.nombreCargo}
                  onChange={(v) => {
                    if (!v) seleccionarEscMiembro(index, { nombre: "", correo: "", telefono: "" });
                    else actualizarEsc(index, "nombreCargo", v);
                  }}
                  onSeleccionar={(m) => seleccionarEscMiembro(index, m)}
                  opciones={equipo}
                />
                <TextInput placeholder="Teléfono" value={dep.escalonamiento.telefono} onChange={(e) => actualizarEsc(index, "telefono", e.target.value)} />
                <TextInput placeholder="Correo" value={dep.escalonamiento.correo} onChange={(e) => actualizarEsc(index, "correo", e.target.value)} />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar contactos internos"}
        </button>
        {guardadoOk && !guardando && <span className="text-xs text-emerald-600">Guardado</span>}
        {error && <span role="alert" className="text-xs text-accent">{error}</span>}
      </div>
    </div>
  );
}
