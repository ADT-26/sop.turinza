"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { SopFormValues } from "@/lib/schemas";

const SECCIONES: { key: keyof SopFormValues; titulo: string }[] = [
  { key: "datosGenerales", titulo: "1. Datos generales del cliente y del SOP" },
  { key: "resumenEjecutivo", titulo: "2. Resumen ejecutivo del cliente" },
  { key: "contactos", titulo: "3. Matriz de contactos" },
  { key: "preferencias", titulo: "4. Preferencias, protocolos y particularidades" },
  { key: "matrizProcesos", titulo: "5. Matriz de procesos y personalizaciones operativas" },
  { key: "interaccionAreas", titulo: "6. Interacción con otras áreas y condiciones comerciales" },
  { key: "cumplimiento", titulo: "7. Cumplimiento normativo y requisitos especiales" },
  { key: "riesgos", titulo: "8. Riesgos operativos y alertas" },
  { key: "aprobaciones", titulo: "9. Observaciones, validación y aprobaciones" },
];

export function ResumenFinal() {
  const { trigger, formState, getValues } = useFormContext<SopFormValues>();
  const [revisado, setRevisado] = useState(false);

  useEffect(() => {
    trigger().then(() => setRevisado(true));
  }, [trigger]);

  const datosGenerales = getValues("datosGenerales");

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Resumen antes de enviar</p>
      <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-muted">Cliente</dt>
          <dd className="text-ink">{datosGenerales.cliente || "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">NIT / ID</dt>
          <dd className="text-ink">{datosGenerales.nit || "—"}</dd>
        </div>
      </dl>
      <ul className="space-y-1 text-sm">
        {SECCIONES.map(({ key, titulo }) => {
          const tieneErrores = revisado && Boolean(formState.errors[key]);
          return (
            <li key={key} className="flex items-center gap-2">
              <span className={tieneErrores ? "text-accent" : "text-emerald-600"}>
                {revisado ? (tieneErrores ? "✗" : "✓") : "…"}
              </span>
              <span className={tieneErrores ? "text-ink" : "text-ink-muted"}>{titulo}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
