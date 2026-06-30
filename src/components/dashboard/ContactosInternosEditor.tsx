"use client";

import { useState } from "react";
import { TextInput } from "@/components/ui";
import { AREAS_CONTACTO, type TablaContactos } from "@/lib/schemas";

export function ContactosInternosEditor({
  id,
  valorInicial,
}: {
  id: string;
  valorInicial: TablaContactos;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      {AREAS_CONTACTO.map((area, index) => {
        const dep = valor.departamentos[index];
        const actualizarDep = (campo: keyof typeof dep, valorCampo: string) => {
          setValor((v) => {
            const departamentos = [...v.departamentos];
            departamentos[index] = { ...departamentos[index], [campo]: valorCampo };
            return { ...v, departamentos };
          });
        };
        return (
          <div key={area} className="rounded-lg border border-line bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm font-medium text-ink-muted sm:col-span-2">{area}</p>
              <TextInput
                placeholder="Nombre / Cargo"
                value={dep.nombreCargo}
                onChange={(e) => actualizarDep("nombreCargo", e.target.value)}
              />
              <TextInput
                placeholder="Teléfono"
                value={dep.telefono}
                onChange={(e) => actualizarDep("telefono", e.target.value)}
              />
              <TextInput
                placeholder="Correo"
                value={dep.correo}
                onChange={(e) => actualizarDep("correo", e.target.value)}
              />
              <TextInput
                placeholder="Backus"
                value={dep.backus}
                onChange={(e) => actualizarDep("backus", e.target.value)}
              />
            </div>
          </div>
        );
      })}

      <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4">
        <p className="mb-2 text-sm font-medium text-accent">Contacto de escalonamiento</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            placeholder="Nombre / Cargo"
            value={valor.escalonamiento.nombreCargo}
            onChange={(e) =>
              setValor((v) => ({
                ...v,
                escalonamiento: { ...v.escalonamiento, nombreCargo: e.target.value },
              }))
            }
          />
          <TextInput
            placeholder="Teléfono"
            value={valor.escalonamiento.telefono}
            onChange={(e) =>
              setValor((v) => ({
                ...v,
                escalonamiento: { ...v.escalonamiento, telefono: e.target.value },
              }))
            }
          />
          <TextInput
            placeholder="Correo"
            className="sm:col-span-2"
            value={valor.escalonamiento.correo}
            onChange={(e) =>
              setValor((v) => ({
                ...v,
                escalonamiento: { ...v.escalonamiento, correo: e.target.value },
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-admin px-4 py-2 text-sm font-semibold text-white hover:bg-admin/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar contactos internos"}
        </button>
        {guardadoOk && !guardando && <span className="text-xs text-emerald-600">Guardado</span>}
        {error && (
          <span role="alert" className="text-xs text-accent">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
