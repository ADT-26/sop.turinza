"use client";

import { useEffect, useRef, useState } from "react";

const LARGO_MINIMO = 3;
const DEBOUNCE_MS = 300;

interface ResultadoCliente {
  id: number;
  razon_social: string;
  nit: string;
}

export function ClienteAutocomplete({
  value,
  onChange,
  onSeleccionar,
}: {
  value: string;
  onChange: (razonSocial: string) => void;
  onSeleccionar?: (cliente: ResultadoCliente) => void;
}) {
  const [resultados, setResultados] = useState<ResultadoCliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const peticionIdRef = useRef(0);

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < LARGO_MINIMO) { setResultados([]); setBuscando(false); return; }

    setBuscando(true);
    const id = ++peticionIdRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clientes/buscar?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (id === peticionIdRef.current) setResultados(json.success ? json.data : []);
      } catch {
        if (id === peticionIdRef.current) setResultados([]);
      } finally {
        if (id === peticionIdRef.current) setBuscando(false);
      }
    }, DEBOUNCE_MS);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  function seleccionar(c: ResultadoCliente) {
    onChange(c.razon_social);
    onSeleccionar?.(c);
    setResultados([]);
    setAbierto(false);
    setActivo(-1);
  }

  function tecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto || resultados.length === 0) return;
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); seleccionar(resultados[0]); }
    else if (e.key === "Escape") { setAbierto(false); }
  }

  const q = value.trim();
  const mostrarMin = abierto && q.length > 0 && q.length < LARGO_MINIMO;
  const mostrarBuscando = abierto && buscando && q.length >= LARGO_MINIMO;
  const mostrarResultados = abierto && !buscando && q.length >= LARGO_MINIMO && resultados.length > 0;
  const sinResultados = abierto && !buscando && q.length >= LARGO_MINIMO && resultados.length === 0;

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={abierto}
        autoComplete="off"
        placeholder="Escribe el nombre del cliente…"
        value={value}
        onChange={(e) => { onChange(e.target.value); setAbierto(true); setActivo(-1); }}
        onFocus={() => setAbierto(true)}
        onKeyDown={tecla}
        className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-navy/30"
      />
      {mostrarMin && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs text-ink-muted shadow-md">
          Escribe al menos {LARGO_MINIMO} letras para buscar
        </div>
      )}
      {mostrarBuscando && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs text-ink-muted shadow-md">
          Buscando…
        </div>
      )}
      {mostrarResultados && resultados[0] && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full rounded-md border border-line bg-white shadow-lg">
          <li
            role="option"
            aria-selected
            onMouseDown={(e) => { e.preventDefault(); seleccionar(resultados[0]); }}
            className="cursor-pointer px-3 py-2 hover:bg-surface"
          >
            <p className="text-sm font-medium text-ink">{resultados[0].razon_social}</p>
            {resultados[0].nit && (
              <p className="text-xs text-ink-muted">NIT {resultados[0].nit}</p>
            )}
          </li>
        </ul>
      )}
      {sinResultados && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs text-ink-muted shadow-md">
          No se encontraron clientes con ese nombre
        </div>
      )}
    </div>
  );
}
