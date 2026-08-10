"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput } from "@/components/ui";
import { AREAS_CONTACTO_INTERNOS, type TablaContactosInternos } from "@/lib/schemas";
import type { MiembroEquipo } from "@/lib/configStore";

const MIN_CHARS = 3;

const EQUIPO_FALLBACK: MiembroEquipo[] = [
  { nombre: "Andrea Camila Curiel Borrego",     correo: "camila.curiel@turinza.com",    telefono: "" },
  { nombre: "Andres Felipe Gómez Chaguala",     correo: "andres.gomez@turinza.com",     telefono: "3188110743" },
  { nombre: "Camilo Andres Corredor Mendoza",   correo: "camilo.corredor@turinza.com",  telefono: "3183101488" },
  { nombre: "Carlos Del Toro Benavides",        correo: "comercial@turinza.com",        telefono: "3133671357" },
  { nombre: "Carlos Rodriguez",                 correo: "carlos.rodriguez@turinza.com", telefono: "" },
  { nombre: "Cristian Camilo Martinez Londoño", correo: "C.martinez@turinza.com",       telefono: "3188834025" },
  { nombre: "Diana P Méndez García",            correo: "comercial5@turinza.com",       telefono: "3186805730" },
  { nombre: "Diego Segura",                     correo: "comercial2@turinza.com",       telefono: "3160598633" },
  { nombre: "Elkin Andres Salinas Silva",       correo: "Insidesale2@turinza.com",      telefono: "3184648172" },
  { nombre: "Iliana Melissa Garzon Buritica",   correo: "melissa.garzon@turinza.com",   telefono: "3168964763" },
  { nombre: "Ingrid Lorena Gallo Mendoza",      correo: "lorena.mendoza@turinza.com",   telefono: "3186174500" },
  { nombre: "Jhon Jairo Martinez Ibañez",       correo: "j.martinez@turinza.com",       telefono: "" },
  { nombre: "Juan Carlos Mendoza Patiño",       correo: "juan.mendoza@turinza.com",     telefono: "3182132700" },
  { nombre: "Pablo Enrique Cholo Buitrago",     correo: "pablo.cholo@turinza.com",      telefono: "3183115959" },
  { nombre: "Patricia Rincon",                  correo: "P.rincon@turinza.com",         telefono: "3057437492" },
  { nombre: "Sandra Juliette Hernandez Parga",  correo: "sandra.hernandez@turinza.com", telefono: "" },
  { nombre: "Sara Valentina Santamaria",        correo: "Sara.santamaria@turinza.com",  telefono: "3187157757" },
  { nombre: "VVG",                              correo: "",                             telefono: "" },
  { nombre: "Yenifer Alejandra Grisales Reyes", correo: "yenifer.grisales@turinza.com", telefono: "" },
];

function normalizar(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function AutocompleteInput({
  value,
  onChange,
  onSeleccionar,
  opciones,
}: {
  value: string;
  onChange: (v: string) => void;
  onSeleccionar: (m: MiembroEquipo) => void;
  opciones: MiembroEquipo[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const query = normalizar(value);
  const sugerencias =
    query.length >= MIN_CHARS
      ? opciones.filter((m) => normalizar(m.nombre).includes(query))
      : [];
  const sinMatch = query.length >= MIN_CHARS && sugerencias.length === 0;
  const mostrar = abierto && (sugerencias.length > 0 || sinMatch);

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

  function seleccionar(m: MiembroEquipo) {
    onSeleccionar(m);
    setAbierto(false);
    setActivo(-1);
  }

  function tecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrar) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActivo((a) => Math.min(a + 1, sugerencias.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && activo >= 0) { e.preventDefault(); seleccionar(sugerencias[activo]); }
    else if (e.key === "Escape") { setAbierto(false); setActivo(-1); }
  }

  return (
    <div ref={ref} className="relative">
      <TextInput
        placeholder="Nombre / Cargo"
        value={value}
        onChange={(e) => { onChange(e.target.value); setAbierto(true); setActivo(-1); }}
        onKeyDown={tecla}
        onFocus={() => setAbierto(true)}
        autoComplete="off"
      />
      {mostrar && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-line bg-white shadow-lg">
          {sugerencias.map((m, i) => (
            <li
              key={m.nombre}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(e) => { e.preventDefault(); seleccionar(m); }}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-2 ${i === activo ? "bg-navy text-white" : "hover:bg-surface"}`}
            >
              <p className={`text-sm font-medium ${i === activo ? "text-white" : "text-ink"}`}>{m.nombre}</p>
              {(m.correo || m.telefono) && (
                <p className={`text-xs ${i === activo ? "text-white/70" : "text-ink-muted"}`}>
                  {[m.correo, m.telefono].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          ))}
          {sinMatch && (
            <li className="px-3 py-2 text-xs text-ink-muted">
              Sin coincidencias —{" "}
              <a
                href="/dashboard#equipo"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-navy underline-offset-2 hover:underline"
                onMouseDown={(e) => e.preventDefault()}
              >
                gestionar equipo ↗
              </a>
            </li>
          )}
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
          <div key={area} className="rounded-lg border border-line bg-white overflow-hidden">
            <p className="px-4 pt-3 pb-2 text-sm font-semibold text-navy">{area}</p>
            <div className="px-4 pb-3 grid gap-3 sm:grid-cols-2">
              <AutocompleteInput
                value={dep.nombreCargo}
                onChange={(v) => actualizarDep(index, "nombreCargo", v)}
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
                onSeleccionar={(m) => actualizarDep(index, "backup", m.nombre)}
                opciones={equipo}
              />
            </div>
            <div className="border-t border-line/60 bg-surface px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/60">Escalonamiento</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <TextInput placeholder="Nombre / Cargo" value={dep.escalonamiento.nombreCargo} onChange={(e) => actualizarEsc(index, "nombreCargo", e.target.value)} />
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
