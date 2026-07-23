"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Field, TextInput, Select, RadioGroup, RepeatableTable } from "@/components/ui";
import { OPCIONES_AREA_RESPONSABLE, OPCIONES_FRECUENCIA_CORTA, OPCIONES_SI_NO_NA } from "@/lib/options";
import { PROCESOS_OPERATIVOS } from "@/lib/schemas";
import { NOTAS } from "@/lib/formNotes";
import type { SopFormValues } from "@/lib/schemas";

function FilaProceso({ proceso, index }: { proceso: string; index: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const aplica = useWatch({ control, name: `matrizProcesos.${index}.aplica` });
  const e = errors.matrizProcesos?.[index];
  const aplicaSi = aplica === "Sí";

  return (
    <>
      <p className="text-sm font-semibold text-ink sm:col-span-2">{proceso}</p>
      <Field label="Aplica" error={e?.aplica?.message} nota={NOTAS["matrizProcesos.aplica"]}>
        <Controller
          control={control}
          name={`matrizProcesos.${index}.aplica`}
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
          <Field label="Responsable" error={e?.responsable?.message} nota={NOTAS["matrizProcesos.responsable"]}>
            <Select
              options={OPCIONES_AREA_RESPONSABLE}
              {...register(`matrizProcesos.${index}.responsable`)}
            />
          </Field>
          <Field label="Actividad / Hito" nota={NOTAS["matrizProcesos.actividadHito"]}>
            <TextInput {...register(`matrizProcesos.${index}.actividadHito`)} />
          </Field>
          <Field label="Personalización acordada" nota={NOTAS["matrizProcesos.personalizacionAcordada"]}>
            <TextInput {...register(`matrizProcesos.${index}.personalizacionAcordada`)} />
          </Field>
          <Field label="SLA / Tiempo" error={e?.slaTiempo?.message} nota={NOTAS["matrizProcesos.slaTiempo"]}>
            <Select
              options={OPCIONES_FRECUENCIA_CORTA}
              {...register(`matrizProcesos.${index}.slaTiempo`)}
            />
          </Field>
          <Field label="KPI asociado" nota={NOTAS["matrizProcesos.kpiAsociado"]}>
            <TextInput {...register(`matrizProcesos.${index}.kpiAsociado`)} />
          </Field>
          <Field label="Control / Evidencia" className="sm:col-span-2" nota={NOTAS["matrizProcesos.controlEvidencia"]}>
            <TextInput {...register(`matrizProcesos.${index}.controlEvidencia`)} />
          </Field>
        </>
      )}
    </>
  );
}

export function Section5MatrizProcesos() {
  return (
    <RepeatableTable
      rows={PROCESOS_OPERATIVOS}
      getRowKey={(proceso) => proceso}
      renderRow={(proceso, index) => <FilaProceso proceso={proceso} index={index} />}
    />
  );
}
