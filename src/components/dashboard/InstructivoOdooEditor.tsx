"use client";

import { useState } from "react";
import { TextInput } from "@/components/ui";

export function InstructivoOdooEditor({
  id,
  valorInicial,
}: {
  id: string;
  valorInicial: string;
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
        body: JSON.stringify({ instructivoOdooCliente: valor }),
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <TextInput
        placeholder="Ej: https://ayuda.odoo.com/... o descripción del instructivo"
        value={valor}
        onChange={(e) => { setValor(e.target.value); setGuardadoOk(false); }}
        className="flex-1"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        {guardadoOk && !guardando && <span className="text-xs text-emerald-600">Guardado</span>}
        {error && <span role="alert" className="text-xs text-accent">{error}</span>}
      </div>
    </div>
  );
}
