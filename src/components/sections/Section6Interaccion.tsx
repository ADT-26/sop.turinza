"use client";

import { useFormContext } from "react-hook-form";
import { Field, TextInput, TextArea, RepeatableTable } from "@/components/ui";
import { AREAS_INTERACCION } from "@/lib/schemas";
import type { SopFormValues } from "@/lib/schemas";

export function Section6Interaccion() {
  const { register } = useFormContext<SopFormValues>();

  return (
    <RepeatableTable
      rows={AREAS_INTERACCION}
      getRowKey={(area) => area}
      renderRow={(area, index) => (
        <>
          <p className="text-sm font-semibold text-ink sm:col-span-2">{area}</p>
          <Field label="Regla / condición acordada" className="sm:col-span-2">
            <TextArea rows={2} {...register(`interaccionAreas.${index}.reglaCondicionAcordada`)} />
          </Field>
          <Field label="Impacto operativo">
            <TextInput {...register(`interaccionAreas.${index}.impactoOperativo`)} />
          </Field>
          <Field label="Observaciones">
            <TextInput {...register(`interaccionAreas.${index}.observaciones`)} />
          </Field>
        </>
      )}
    />
  );
}
