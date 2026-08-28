"use client";

import { useEffect, useRef, useState } from "react";
import { SECTORES_INDUSTRIA } from "@/lib/sectores";
import { normalizar } from "@/components/dashboard/AutocompleteInput";

const MAX_VISIBLE = 10;

export function SectorAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const query = normalizar(value.trim());
  const coincidencias =
    query.length >= 1
      ? SECTORES_INDUSTRIA.filter((s) => normalizar(s).includes(query))
      : [];

  const visibles = coincidencias.slice(0, MAX_VISIBLE);
  const restantes = coincidencias.length - MAX_VISIBLE;
  const sinMatch = query.length >= 1 && coincidencias.length === 0;
  const mostrar = abierto && (visibles.length > 0 || sinMatch);

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
        setActivo(-1);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  function seleccionar(sector: string) {
    onChange(sector);
    setAbierto(false);
    setActivo(-1);
  }

  function tecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrar) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActivo((a) => Math.min(a + 1, visibles.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && activo >= 0) { e.preventDefault(); seleccionar(visibles[activo]); }
    else if (e.key === "Escape") { setAbierto(false); setActivo(-1); }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        autoComplete="off"
        placeholder="Ej: logística, textiles…"
        onChange={(e) => { onChange(e.target.value); setAbierto(true); setActivo(-1); }}
        onFocus={() => { if (value.trim().length >= 1) setAbierto(true); }}
        onKeyDown={tecla}
        className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-navy/30"
      />
      {mostrar && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-line bg-white shadow-lg"
        >
          {visibles.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(e) => { e.preventDefault(); seleccionar(s); }}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${i === activo ? "bg-primary-dark text-white" : "text-ink hover:bg-surface"}`}
            >
              {s}
            </li>
          ))}
          {restantes > 0 && (
            <li className="px-3 py-2 text-xs text-ink-muted border-t border-line/50">
              +{restantes} resultado{restantes !== 1 ? "s" : ""} más — refine la búsqueda
            </li>
          )}
          {sinMatch && (
            <li className="px-3 py-2 text-xs text-ink-muted">
              Sin coincidencias
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
