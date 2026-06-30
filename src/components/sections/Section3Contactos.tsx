"use client";

import { useFormContext } from "react-hook-form";
import { Field, TextInput } from "@/components/ui";
import { AREAS_CONTACTO } from "@/lib/schemas";
import type { SopFormValues } from "@/lib/schemas";

function TablaContactos({ titulo, base }: { titulo: string; base: "internos" | "cliente" }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const e = errors.contactos?.[base];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      <div className="space-y-3">
        {AREAS_CONTACTO.map((area, index) => (
          <div key={area} className="rounded-lg border border-line bg-surface p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm font-medium text-ink-muted sm:col-span-2">{area}</p>
              <Field label="Nombre / Cargo" error={e?.departamentos?.[index]?.nombreCargo?.message}>
                <TextInput {...register(`contactos.${base}.departamentos.${index}.nombreCargo`)} />
              </Field>
              <Field label="Teléfono" error={e?.departamentos?.[index]?.telefono?.message}>
                <TextInput {...register(`contactos.${base}.departamentos.${index}.telefono`)} />
              </Field>
              <Field label="Correo" error={e?.departamentos?.[index]?.correo?.message}>
                <TextInput type="email" {...register(`contactos.${base}.departamentos.${index}.correo`)} />
              </Field>
              <Field label="Backus" error={e?.departamentos?.[index]?.backus?.message}>
                <TextInput {...register(`contactos.${base}.departamentos.${index}.backus`)} />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4">
        <p className="mb-2 text-sm font-medium text-accent">Contacto de escalonamiento</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre / Cargo" error={e?.escalonamiento?.nombreCargo?.message}>
            <TextInput {...register(`contactos.${base}.escalonamiento.nombreCargo`)} />
          </Field>
          <Field label="Teléfono" error={e?.escalonamiento?.telefono?.message}>
            <TextInput {...register(`contactos.${base}.escalonamiento.telefono`)} />
          </Field>
          <Field label="Correo" className="sm:col-span-2" error={e?.escalonamiento?.correo?.message}>
            <TextInput type="email" {...register(`contactos.${base}.escalonamiento.correo`)} />
          </Field>
        </div>
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
