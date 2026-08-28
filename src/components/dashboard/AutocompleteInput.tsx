"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput } from "@/components/ui";
import type { MiembroEquipo } from "@/lib/configStore";

export const EQUIPO_FALLBACK: MiembroEquipo[] = [
  { nombre: "Andrea Camila Curiel Borrego",     cargo: "", correo: "camila.curiel@turinza.com",    telefono: "" },
  { nombre: "Andres Felipe Gómez Chaguala",     cargo: "", correo: "andres.gomez@turinza.com",     telefono: "3188110743" },
  { nombre: "Camilo Andres Corredor Mendoza",   cargo: "", correo: "camilo.corredor@turinza.com",  telefono: "3183101488" },
  { nombre: "Carlos Del Toro Benavides",        cargo: "", correo: "comercial@turinza.com",        telefono: "3133671357" },
  { nombre: "Carlos Rodriguez",                 cargo: "", correo: "carlos.rodriguez@turinza.com", telefono: "" },
  { nombre: "Cristian Camilo Martinez Londoño", cargo: "", correo: "C.martinez@turinza.com",       telefono: "3188834025" },
  { nombre: "Diana P Méndez García",            cargo: "", correo: "comercial5@turinza.com",       telefono: "3186805730" },
  { nombre: "Diego Segura",                     cargo: "", correo: "comercial2@turinza.com",       telefono: "3160598633" },
  { nombre: "Elkin Andres Salinas Silva",       cargo: "", correo: "Insidesale2@turinza.com",      telefono: "3184648172" },
  { nombre: "Iliana Melissa Garzon Buritica",   cargo: "", correo: "melissa.garzon@turinza.com",   telefono: "3168964763" },
  { nombre: "Ingrid Lorena Gallo Mendoza",      cargo: "", correo: "lorena.mendoza@turinza.com",   telefono: "3186174500" },
  { nombre: "Jhon Jairo Martinez Ibañez",       cargo: "", correo: "j.martinez@turinza.com",       telefono: "" },
  { nombre: "Juan Carlos Mendoza Patiño",       cargo: "", correo: "juan.mendoza@turinza.com",     telefono: "3182132700" },
  { nombre: "Pablo Enrique Cholo Buitrago",     cargo: "", correo: "pablo.cholo@turinza.com",      telefono: "3183115959" },
  { nombre: "Patricia Rincon",                  cargo: "", correo: "P.rincon@turinza.com",         telefono: "3057437492" },
  { nombre: "Sandra Juliette Hernandez Parga",  cargo: "", correo: "sandra.hernandez@turinza.com", telefono: "" },
  { nombre: "Sara Valentina Santamaria",        cargo: "", correo: "Sara.santamaria@turinza.com",  telefono: "3187157757" },
  { nombre: "VVG",                              cargo: "", correo: "",                             telefono: "" },
  { nombre: "Yenifer Alejandra Grisales Reyes", cargo: "", correo: "yenifer.grisales@turinza.com", telefono: "" },
];

const MIN_CHARS = 3;

export function normalizar(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function AutocompleteInput({
  value,
  onChange,
  onSeleccionar,
  opciones,
  placeholder = "Nombre / Cargo",
}: {
  value: string;
  onChange: (v: string) => void;
  onSeleccionar: (m: MiembroEquipo) => void;
  opciones: MiembroEquipo[];
  placeholder?: string;
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
        placeholder={placeholder}
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
              className={`cursor-pointer px-3 py-2 ${i === activo ? "bg-primary-dark text-white" : "hover:bg-surface"}`}
            >
              <p className={`text-sm font-medium ${i === activo ? "text-white" : "text-ink"}`}>{m.nombre}</p>
              {(m.cargo || m.correo) && (
                <p className={`text-xs ${i === activo ? "text-white/70" : "text-ink-muted"}`}>
                  {[m.cargo, m.correo].filter(Boolean).join(" · ")}
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
