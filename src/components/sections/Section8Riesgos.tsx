"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Field, TextInput, Select, RepeatableTable } from "@/components/ui";
import { OPCIONES_AREA_RESPONSABLE, OPCIONES_PRIORIDAD } from "@/lib/options";
import { crearRiesgoVacio } from "@/lib/formDefaults";
import type { SopFormValues } from "@/lib/schemas";

export function Section8Riesgos() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "riesgos" });

  return (
    <RepeatableTable
      rows={fields}
      getRowKey={(row) => row.id}
      onAddRow={() => append(crearRiesgoVacio())}
      onRemoveRow={fields.length > 1 ? (index) => remove(index) : undefined}
      addLabel="Agregar riesgo"
      renderRow={(_row, index) => {
        const e = errors.riesgos?.[index];
        return (
          <>
            <Field
              label="Riesgo / cambio identificado"
              className="sm:col-span-2"
              error={e?.riesgoCambioIdentificado?.message}
            >
              <TextInput {...register(`riesgos.${index}.riesgoCambioIdentificado`)} />
            </Field>
            <Field label="Impacto" error={e?.impacto?.message}>
              <Select options={OPCIONES_PRIORIDAD} {...register(`riesgos.${index}.impacto`)} />
            </Field>
            <Field label="Responsable" error={e?.responsable?.message}>
              <Select options={OPCIONES_AREA_RESPONSABLE} {...register(`riesgos.${index}.responsable`)} />
            </Field>
            <Field label="Acción correctiva">
              <TextInput {...register(`riesgos.${index}.accionCorrectiva`)} />
            </Field>
            <Field label="Eficacia">
              <TextInput {...register(`riesgos.${index}.eficacia`)} />
            </Field>
          </>
        );
      }}
    />
  );
}
