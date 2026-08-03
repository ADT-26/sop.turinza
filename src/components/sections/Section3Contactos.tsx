"use client";

import { useFormContext } from "react-hook-form";
import { Field, TextInput } from "@/components/ui";
import { AREAS_CONTACTO } from "@/lib/schemas";
import { NOTAS } from "@/lib/formNotes";
import type { SopFormValues } from "@/lib/schemas";

function TablaContactos({ titulo, base }: { titulo: string; base: "cliente" }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const e = errors.contactos?.[base];

  const nota = NOTAS["contactos.cliente"];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
        {nota && (
          <details className="mt-1">
            <summary className="flex w-fit cursor-pointer list-none select-none items-center gap-1 text-xs text-ink-muted hover:text-ink">
              <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="7" /><path d="M8 7v5M8 5.5v.5" strokeLinecap="round" />
              </svg>
              <span>Ver nota del formato</span>
            </summary>
            <p className="mt-1 border-l-2 border-primary/30 pl-2 text-xs text-ink-muted/80">{nota}</p>
          </details>
        )}
      </div>
      <div className="space-y-3">
        {AREAS_CONTACTO.map((area, index) => (
          <div key={area} className="rounded-lg border border-line bg-surface overflow-hidden">
            <p className="px-4 pt-3 pb-2 text-sm font-medium text-ink-muted">{area}</p>
            <div className="px-4 pb-3 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre / Cargo" error={e?.departamentos?.[index]?.nombreCargo?.message}>
                <TextInput {...register(`contactos.${base}.departamentos.${index}.nombreCargo`)} />
              </Field>
              <Field label="Teléfono" error={e?.departamentos?.[index]?.telefono?.message}>
                <TextInput {...register(`contactos.${base}.departamentos.${index}.telefono`)} />
              </Field>
              <Field label="Correo" error={e?.departamentos?.[index]?.correo?.message}>
                <TextInput type="email" {...register(`contactos.${base}.departamentos.${index}.correo`)} />
              </Field>
              <Field label="Backup" error={e?.departamentos?.[index]?.backup?.message}>
                <TextInput {...register(`contactos.${base}.departamentos.${index}.backup`)} />
              </Field>
            </div>
            <div className="border-t border-line/60 bg-surface px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/60">
                Escalonamiento
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextInput placeholder="Nombre / Cargo" {...register(`contactos.${base}.departamentos.${index}.escalonamiento.nombreCargo`)} />
                <TextInput placeholder="Teléfono" {...register(`contactos.${base}.departamentos.${index}.escalonamiento.telefono`)} />
                <TextInput type="email" placeholder="Correo" {...register(`contactos.${base}.departamentos.${index}.escalonamiento.correo`)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Los Contactos internos Turinza / Cuenta no los diligencia el cliente: los
// asigna el administrador desde el panel interno una vez recibe el SOP.
export function Section3Contactos() {
  return (
    <div className="space-y-6">
      <TablaContactos titulo="Contactos del cliente" base="cliente" />
    </div>
  );
}
