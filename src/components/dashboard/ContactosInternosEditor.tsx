"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput } from "@/components/ui";
import { AREAS_CONTACTO_INTERNOS, type TablaContactosInternos } from "@/lib/schemas";

const MIN_CHARS = 3;

const EQUIPO_FALLBACK = [
  "Camilo Andres Corredor Mendoza",
  "Ingrid Lorena Gallo Mendoza",
  "Jhon Jairo Martinez Ibañez",
  "Carlos Del Toro Benavides",
  "Yenifer Alejandra Grisales Reyes",
  "Juan Carlos Mendoza Patiño",
  "Elkin Andres Salinas Silva",
  "Iliana Melissa Garzon Buritica",
  "Cristian Camilo Martinez Londoño",
  "Patricia Rincon",
  "Diego Segura",
  "Pablo Enrique Cholo Buitrago",
  "Diana P Méndez García",
  "Carlos Rodriguez",
  "VVG",
];

function normalizar(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ── Autocomplete ──────────────────────────────────────────────────────────────

function AutocompleteInput({
  value,
  onChange,
  opciones,
  onAbrirGestor,
}: {
  value: string;
  onChange: (v: string) => void;
  opciones: string[];
  onAbrirGestor: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const query = normalizar(value);
  const sugerencias =
    query.length >= MIN_CHARS
      ? opciones.filter((n) => normalizar(n).includes(query))
      : [];
  const sinMatch = query.length >= MIN_CHARS && sugerencias.length === 0;
  const mostrar = abierto && (sugerencias.length > 0 || sinMatch);

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
              onMouseDown={(e) => { e.preventDefault(); seleccionar(nombre); }}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activo ? "bg-navy text-white" : "text-ink hover:bg-surface"
              }`}
            >
              {nombre}
            </li>
          ))}
          {sinMatch && (
            <li className="border-t border-line/40 px-3 py-2 text-xs text-ink-muted">
              Sin coincidencias —{" "}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setAbierto(false); onAbrirGestor(); }}
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                gestionar equipo
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Gestor de equipo ──────────────────────────────────────────────────────────

function GestorEquipo({
  lista,
  onActualizar,
}: {
  lista: string[];
  onActualizar: (nuevaLista: string[]) => void;
}) {
  const [nombres, setNombres] = useState<string[]>(lista);
  const [nuevo, setNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agregar = () => {
    const nombre = nuevo.trim();
    if (!nombre || nombres.includes(nombre)) return;
    setNombres((prev) => [...prev, nombre]);
    setNuevo("");
    setOk(false);
  };

  const eliminar = (i: number) => {
    setNombres((prev) => prev.filter((_, idx) => idx !== i));
    setOk(false);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/config/equipo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nombres),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al guardar");
      onActualizar(nombres);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-navy/20 bg-navy/5 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-navy/60">
        Equipo Turinza — lista de autocompletado
      </p>
      <ul className="mb-3 space-y-1">
        {nombres.map((nombre, i) => (
          <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-ink shadow-sm">
            <span>{nombre}</span>
            <button
              type="button"
              onClick={() => eliminar(i)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-ink-muted hover:bg-red-50 hover:text-red-500"
              aria-label={`Eliminar ${nombre}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <TextInput
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
          placeholder="Nuevo nombre"
          className="text-sm"
        />
        <button
          type="button"
          onClick={agregar}
          className="shrink-0 rounded-md border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/10"
        >
          Agregar
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar lista"}
        </button>
        {ok && !guardando && <span className="text-xs text-emerald-600">Lista guardada</span>}
        {error && <span className="text-xs text-accent">{error}</span>}
      </div>
    </div>
  );
}

// ── Editor principal ──────────────────────────────────────────────────────────

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
  const [equipoOps, setEquipoOps] = useState<string[]>(EQUIPO_FALLBACK);
  const [gestorAbierto, setGestorAbierto] = useState(false);
  const gestorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/config/equipo")
      .then((r) => r.json())
      .then((j) => { if (j.success && Array.isArray(j.data) && j.data.length > 0) setEquipoOps(j.data); })
      .catch(() => {});
  }, []);

  function abrirGestor() {
    setGestorAbierto(true);
    setTimeout(() => gestorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
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
              <AutocompleteInput
                value={dep.nombreCargo}
                onChange={(v) => actualizarDep("nombreCargo", v)}
                opciones={equipoOps}
                onAbrirGestor={abrirGestor}
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
        <button
          type="button"
          onClick={() => setGestorAbierto((v) => !v)}
          className="ml-auto text-xs text-navy/50 hover:text-navy"
        >
          {gestorAbierto ? "Ocultar gestor de equipo" : "Gestionar equipo ↓"}
        </button>
      </div>

      <div ref={gestorRef}>
        {gestorAbierto && (
          <GestorEquipo
            lista={equipoOps}
            onActualizar={(nuevaLista) => setEquipoOps(nuevaLista)}
          />
        )}
      </div>
    </div>
  );
}
