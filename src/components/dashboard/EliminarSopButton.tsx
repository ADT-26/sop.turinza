"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EliminarSopButton({
  id,
  cliente,
  redirectTo,
}: {
  id: string;
  cliente: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar el SOP de "${cliente}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setEliminando(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al eliminar");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setEliminando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={eliminar}
        disabled={eliminando}
        className="rounded-md border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/5 disabled:opacity-50"
      >
        {eliminando ? "Eliminando..." : "Eliminar SOP"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-accent">
          {error}
        </span>
      )}
    </div>
  );
}
