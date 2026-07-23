"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, TextArea, Select, RadioGroup } from "@/components/ui";
import { OPCIONES_FRECUENCIA_LARGA, OPCIONES_SI_NO_NA } from "@/lib/options";
import { NOTAS } from "@/lib/formNotes";
import type { SopFormValues } from "@/lib/schemas";

export function Section2ResumenEjecutivo() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const e = errors.resumenEjecutivo;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Resumen del negocio del cliente"
          htmlFor="resumenNegocio"
          className="sm:col-span-2"
          nota={NOTAS["resumenEjecutivo.resumenNegocioCliente"]}
        >
          <TextArea id="resumenNegocio" {...register("resumenEjecutivo.resumenNegocioCliente")} />
        </Field>
        <Field
          label="Riesgos críticos / alertas operativas"
          htmlFor="riesgosCriticos"
          className="sm:col-span-2"
          nota={NOTAS["resumenEjecutivo.riesgosCriticosAlertas"]}
        >
          <TextArea id="riesgosCriticos" {...register("resumenEjecutivo.riesgosCriticosAlertas")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Requiere atención 24/7" required error={e?.requiereAtencion247?.message} nota={NOTAS["resumenEjecutivo.requiereAtencion247"]}>
          <Controller
            control={control}
            name="resumenEjecutivo.requiereAtencion247"
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
        <Field label="Requiere reuniones KPI" required error={e?.requiereReunionesKPI?.message} nota={NOTAS["resumenEjecutivo.requiereReunionesKPI"]}>
          <Controller
            control={control}
            name="resumenEjecutivo.requiereReunionesKPI"
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
        <Field
          label="Periodicidad revisión y actualización SOP"
          htmlFor="periodicidad"
          required
          error={e?.periodicidadRevisionSOP?.message}
          nota={NOTAS["resumenEjecutivo.periodicidadRevisionSOP"]}
        >
          <Select
            id="periodicidad"
            options={OPCIONES_FRECUENCIA_LARGA}
            {...register("resumenEjecutivo.periodicidadRevisionSOP")}
          />
        </Field>
      </div>
    </div>
  );
}
