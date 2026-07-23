"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Field, TextInput, Select, RadioGroup, RepeatableTable } from "@/components/ui";
import { OPCIONES_AREA_RESPONSABLE, OPCIONES_SI_NO_NA } from "@/lib/options";
import { REQUISITOS_CUMPLIMIENTO } from "@/lib/schemas";
import { NOTAS } from "@/lib/formNotes";
import type { SopFormValues } from "@/lib/schemas";

function FilaRequisito({ requisito, index }: { requisito: string; index: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const aplica = useWatch({ control, name: `cumplimiento.${index}.aplica` });
  const e = errors.cumplimiento?.[index];
  const aplicaSi = aplica === "Sí";

  return (
    <>
      <p className="text-sm font-semibold text-ink sm:col-span-2">{requisito}</p>
      <Field label="¿Aplica?" error={e?.aplica?.message} nota={NOTAS["cumplimiento.aplica"]}>
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
      {aplicaSi && (
        <>
          <Field label="Responsable" error={e?.responsable?.message} nota={NOTAS["cumplimiento.responsable"]}>
            <Select
              options={OPCIONES_AREA_RESPONSABLE}
              {...register(`cumplimiento.${index}.responsable`)}
            />
          </Field>
          <Field label="Detalle / evidencia / control" className="sm:col-span-2" nota={NOTAS["cumplimiento.detalleEvidenciaControl"]}>
            <TextInput {...register(`cumplimiento.${index}.detalleEvidenciaControl`)} />
          </Field>
        </>
      )}
    </>
  );
}

export function Section7Cumplimiento() {
  return (
    <RepeatableTable
      rows={REQUISITOS_CUMPLIMIENTO}
      getRowKey={(requisito) => requisito}
      renderRow={(requisito, index) => <FilaRequisito requisito={requisito} index={index} />}
    />
  );
}
