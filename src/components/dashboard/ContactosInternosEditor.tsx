"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput } from "@/components/ui";
import { AREAS_CONTACTO_INTERNOS, type TablaContactosInternos } from "@/lib/schemas";

const AREA_OPERACIONES = "Operaciones / Logística";
const MIN_CHARS = 3;

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function AutocompleteNombreCargo({
  value,
  onChange,
  opciones,
}: {
  value: string;
  onChange: (v: string) => void;
  opciones: string[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const query = normalizar(value);
  const sugerencias =
    query.length >= MIN_CHARS
      ? opciones.filter((n) => normalizar(n).includes(query))
      : [];

  const mostrar = abierto && sugerencias.length > 0;

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setActivo(-1);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  function seleccionar(nombre: string) {
    onChange(nombre);
    setAbierto(false);
    setActivo(-1);
  }

  function tecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrar) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((a) => Math.min(a + 1, sugerencias.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && activo >= 0) {
      e.preventDefault();
      seleccionar(sugerencias[activo]);
    } else if (e.key === "Escape") {
      setAbierto(false);
      setActivo(-1);
    }
  }

  return (
    <div ref={contenedorRef} className="relative">
      <TextInput
        placeholder="Nombre / Cargo"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
          setActivo(-1);
        }}
        onKeyDown={tecla}
        onFocus={() => setAbierto(true)}
        autoComplete="off"
      />
      {mostrar && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-line bg-white shadow-lg"
        >
          {sugerencias.map((nombre, i) => (
            <li
              key={nombre}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(nombre);
              }}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activo ? "bg-primary-dark text-white" : "text-ink hover:bg-surface"
              }`}
            >
              {nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  const [equipoOps, setEquipoOps] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/config/equipo")
      .then((r) => r.json())
      .then((j) => { if (j.success) setEquipoOps(j.data); })
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
        const esOperaciones = area === AREA_OPERACIONES;

        const actualizarDep = (campo: keyof Omit<typeof dep, "escalonamiento" | "area">, val: string) => {
          setValor((v) => {
            const departamentos = [...v.departamentos];
            departamentos[index] = { ...departamentos[index], [campo]: val };
            return { ...v, departamentos };
          });
        };
        const actualizarEsc = (campo: keyof typeof dep.escalonamiento, val: string) => {
          setValor((v) => {
            const departamentos = [...v.departamentos];
            departamentos[index] = {
              ...departamentos[index],
              escalonamiento: { ...departamentos[index].escalonamiento, [campo]: val },
            };
            return { ...v, departamentos };
          });
        };

        return (
          <div key={area} className="rounded-lg border border-line bg-white overflow-hidden">
            <p className="px-4 pt-3 pb-2 text-sm font-semibold text-navy">{area}</p>
            <div className="px-4 pb-3 grid gap-3 sm:grid-cols-2">
              {esOperaciones ? (
                <AutocompleteNombreCargo
                  value={dep.nombreCargo}
                  onChange={(v) => actualizarDep("nombreCargo", v)}
                  opciones={equipoOps}
                />
              ) : (
                <TextInput
                  placeholder="Nombre / Cargo"
                  value={dep.nombreCargo}
                  onChange={(e) => actualizarDep("nombreCargo", e.target.value)}
                />
              )}
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
                placeholder="Backup"
                value={dep.backup}
                onChange={(e) => actualizarDep("backup", e.target.value)}
              />
            </div>
            <div className="border-t border-line/60 bg-surface px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/60">
                Escalonamiento
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <TextInput
                  placeholder="Nombre / Cargo"
                  value={dep.escalonamiento.nombreCargo}
                  onChange={(e) => actualizarEsc("nombreCargo", e.target.value)}
                />
                <TextInput
                  placeholder="Teléfono"
                  value={dep.escalonamiento.telefono}
                  onChange={(e) => actualizarEsc("telefono", e.target.value)}
                />
                <TextInput
                  placeholder="Correo"
                  value={dep.escalonamiento.correo}
                  onChange={(e) => actualizarEsc("correo", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
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
