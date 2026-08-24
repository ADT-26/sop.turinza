"use client";

import { useEffect, useState } from "react";
import { TextInput } from "@/components/ui";
import type { MiembroEquipo } from "@/lib/configStore";
import { AutocompleteInput, EQUIPO_FALLBACK } from "@/components/dashboard/AutocompleteInput";

export function FirmaTurinzaEditor({
  id,
  campo,
  titulo,
  valorInicial,
}: {
  id: string;
  campo: "revisoTurinzaComercial" | "revisoTurinza" | "aproboTurinza";
  titulo: string;
  valorInicial: { nombre: string; cargo: string };
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

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setGuardadoOk(false);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: valor }),
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
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-ink">{titulo}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <AutocompleteInput
          value={valor.nombre}
          onChange={(v) => setValor((prev) => ({ ...prev, nombre: v }))}
          onSeleccionar={(m) => setValor({ nombre: m.nombre, cargo: m.cargo || "" })}
          opciones={equipo}
          placeholder="Nombre"
        />
        <TextInput
          placeholder="Cargo"
          value={valor.cargo}
          onChange={(e) => setValor((v) => ({ ...v, cargo: e.target.value }))}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
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
