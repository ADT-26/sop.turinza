"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, TextInput, Select, RadioGroup, RepeatableTable } from "@/components/ui";
import { OPCIONES_AREA_RESPONSABLE, OPCIONES_SI_NO_NA } from "@/lib/options";
import { REQUISITOS_CUMPLIMIENTO } from "@/lib/schemas";
import type { SopFormValues } from "@/lib/schemas";

export function Section7Cumplimiento() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();

  return (
    <RepeatableTable
      rows={REQUISITOS_CUMPLIMIENTO}
      getRowKey={(requisito) => requisito}
      renderRow={(requisito, index) => {
        const e = errors.cumplimiento?.[index];
        return (
          <>
            <p className="text-sm font-semibold text-ink sm:col-span-2">{requisito}</p>
            <Field label="¿Aplica?" error={e?.aplica?.message}>
              <Controller
                control={control}
                name={`cumplimiento.${index}.aplica`}
                render={({ field }) => (
                  <RadioGroup
                    name={field.name}
                    options={OPCIONES_SI_NO_NA}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field label="Responsable" error={e?.responsable?.message}>
              <Select options={OPCIONES_AREA_RESPONSABLE} {...register(`cumplimiento.${index}.responsable`)} />
            </Field>
            <Field label="Detalle / evidencia / control" className="sm:col-span-2">
              <TextInput {...register(`cumplimiento.${index}.detalleEvidenciaControl`)} />
            </Field>
          </>
        );
      }}
    />
  );
}
