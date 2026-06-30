"use client";

import { useState } from "react";
import { Select } from "@/components/ui";
import { OPCIONES_NIVEL_CLIENTE } from "@/lib/options";

export function NivelClienteEditor({ id, valorInicial }: { id: string; valorInicial: string }) {
  const [valor, setValor] = useState(valorInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (nuevoValor: string) => {
    const anterior = valor;
    setValor(nuevoValor);
    setGuardando(true);
    setError(null);
    setGuardadoOk(false);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nivelCliente: nuevoValor }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al guardar");
      setGuardadoOk(true);
    } catch (err) {
      setValor(anterior);
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        options={OPCIONES_NIVEL_CLIENTE}
        placeholder="Sin asignar"
        value={valor}
        onChange={(e) => guardar(e.target.value)}
        className="max-w-[180px]"
      />
      {guardando && <span className="text-xs text-ink-muted">Guardando...</span>}
      {guardadoOk && !guardando && <span className="text-xs text-emerald-600">Guardado</span>}
      {error && (
        <span role="alert" className="text-xs text-accent">
          {error}
        </span>
      )}
    </div>
  );
}
