"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, TextInput, Select, RadioGroup, RepeatableTable } from "@/components/ui";
import { OPCIONES_AREA_RESPONSABLE, OPCIONES_FRECUENCIA_CORTA, OPCIONES_SI_NO_NA } from "@/lib/options";
import { PROCESOS_OPERATIVOS } from "@/lib/schemas";
import type { SopFormValues } from "@/lib/schemas";

export function Section5MatrizProcesos() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();

  return (
    <RepeatableTable
      rows={PROCESOS_OPERATIVOS}
      getRowKey={(proceso) => proceso}
      renderRow={(proceso, index) => {
        const e = errors.matrizProcesos?.[index];
        return (
          <>
            <p className="text-sm font-semibold text-ink sm:col-span-2">{proceso}</p>
            <Field label="Aplica" error={e?.aplica?.message}>
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
            <Field label="Responsable" error={e?.responsable?.message}>
              <Select options={OPCIONES_AREA_RESPONSABLE} {...register(`matrizProcesos.${index}.responsable`)} />
            </Field>
            <Field label="Actividad / Hito">
              <TextInput {...register(`matrizProcesos.${index}.actividadHito`)} />
            </Field>
            <Field label="Personalización acordada">
              <TextInput {...register(`matrizProcesos.${index}.personalizacionAcordada`)} />
            </Field>
            <Field label="SLA / Tiempo" error={e?.slaTiempo?.message}>
              <Select options={OPCIONES_FRECUENCIA_CORTA} {...register(`matrizProcesos.${index}.slaTiempo`)} />
            </Field>
            <Field label="KPI asociado">
              <TextInput {...register(`matrizProcesos.${index}.kpiAsociado`)} />
            </Field>
            <Field label="Control / Evidencia" className="sm:col-span-2">
              <TextInput {...register(`matrizProcesos.${index}.controlEvidencia`)} />
            </Field>
          </>
        );
      }}
    />
  );
}
