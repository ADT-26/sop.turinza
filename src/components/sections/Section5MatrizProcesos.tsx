"use client";

import { Controller, useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { Field, TextInput, Select, RadioGroup } from "@/components/ui";
import { OPCIONES_AREA_RESPONSABLE, OPCIONES_SI_NO_NA } from "@/lib/options";
import { PROCESOS_OPERATIVOS } from "@/lib/schemas";
import { NOTAS } from "@/lib/formNotes";
import type { SopFormValues } from "@/lib/schemas";

const FILA_VACIA = {
  actividadHito: "",
  personalizacionAcordada: "",
  responsable: "",
  slaTiempo: "",
  kpiAsociado: "",
  controlEvidencia: "",
};

function FilasGrupo({ grupoIndex }: { grupoIndex: number }) {
  const { register, control, formState: { errors } } = useFormContext<SopFormValues>();
  const aplica = useWatch({ control, name: `matrizProcesos.${grupoIndex}.aplica` });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `matrizProcesos.${grupoIndex}.filas`,
  });

  if (aplica !== "Sí") return null;

  return (
    <div className="mt-4 space-y-3">
      {fields.map((field, j) => {
        const err = errors.matrizProcesos?.[grupoIndex]?.filas?.[j];
        return (
          <div key={field.id} className="relative rounded-md border border-line bg-white p-4">
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(j)}
                aria-label="Eliminar fila"
                className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs text-ink-muted hover:bg-red-50 hover:text-red-500"
              >
                ✕
              </button>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Responsable" required error={err?.responsable?.message} nota={NOTAS["matrizProcesos.responsable"]}>
                <Select
                  options={OPCIONES_AREA_RESPONSABLE}
                  {...register(`matrizProcesos.${grupoIndex}.filas.${j}.responsable`)}
                />
              </Field>
              <Field label="SLA / Tiempo" nota={NOTAS["matrizProcesos.slaTiempo"]}>
                <TextInput
                  placeholder='p. ej. 24 h, mismo día, 2 días hábiles'
                  {...register(`matrizProcesos.${grupoIndex}.filas.${j}.slaTiempo`)}
                />
              </Field>
              <Field label="Actividad / Hito" nota={NOTAS["matrizProcesos.actividadHito"]}>
                <TextInput {...register(`matrizProcesos.${grupoIndex}.filas.${j}.actividadHito`)} />
              </Field>
              <Field label="Personalización acordada" nota={NOTAS["matrizProcesos.personalizacionAcordada"]}>
                <TextInput {...register(`matrizProcesos.${grupoIndex}.filas.${j}.personalizacionAcordada`)} />
              </Field>
              <Field label="KPI asociado" nota={NOTAS["matrizProcesos.kpiAsociado"]}>
                <TextInput {...register(`matrizProcesos.${grupoIndex}.filas.${j}.kpiAsociado`)} />
              </Field>
              <Field label="Control / Evidencia" nota={NOTAS["matrizProcesos.controlEvidencia"]}>
                <TextInput {...register(`matrizProcesos.${grupoIndex}.filas.${j}.controlEvidencia`)} />
              </Field>
            </div>
          </div>
        );
      })}
      {fields.length < 4 && (
        <button
          type="button"
          onClick={() => append(FILA_VACIA)}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-primary/40 px-3 py-2 text-xs font-medium text-primary hover:border-primary hover:bg-primary/5"
        >
          <span aria-hidden="true">+</span> Agregar fila
        </button>
      )}
    </div>
  );
}

function GrupoProceso({ proceso, grupoIndex }: { proceso: string; grupoIndex: number }) {
  const { control, formState: { errors } } = useFormContext<SopFormValues>();
  const e = errors.matrizProcesos?.[grupoIndex];

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-ink">{proceso}</p>
      <Field label="Aplica" required error={e?.aplica?.message} nota={NOTAS["matrizProcesos.aplica"]}>
        <Controller
          control={control}
          name={`matrizProcesos.${grupoIndex}.aplica`}
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
      <FilasGrupo grupoIndex={grupoIndex} />
    </div>
  );
}

export function Section5MatrizProcesos() {
  return (
    <div className="space-y-4">
      {PROCESOS_OPERATIVOS.map((proceso, index) => (
        <GrupoProceso key={proceso} proceso={proceso} grupoIndex={index} />
      ))}
    </div>
  );
}
