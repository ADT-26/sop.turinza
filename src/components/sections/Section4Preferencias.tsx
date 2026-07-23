"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, TextInput, TextArea, Select, RadioGroup } from "@/components/ui";
import {
  OPCIONES_CANAL_ODOO,
  OPCIONES_FRECUENCIA_COMUNICACION,
  OPCIONES_SI_NO_NA,
  OPCIONES_TIPO_COMUNICACION,
} from "@/lib/options";
import { NOTAS } from "@/lib/formNotes";
import type { SopFormValues } from "@/lib/schemas";

const NOTAS_TIPO_COMUNICACION = [
  NOTAS["comunicacion.informativa"],
  NOTAS["comunicacion.preventiva"],
  NOTAS["comunicacion.alertas"],
] as const;

export function Section4Preferencias() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const e = errors.preferencias;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">
          4.1 Trazabilidad de operaciones &amp; reportes
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Frecuencia de reportes del consolidado"
            htmlFor="frecuenciaReportes"
            required
            error={e?.trazabilidad?.frecuenciaReportes?.message}
            nota={NOTAS["preferencias.trazabilidad.frecuenciaReportes"]}
          >
            <Select
              id="frecuenciaReportes"
              options={OPCIONES_FRECUENCIA_COMUNICACION}
              {...register("preferencias.trazabilidad.frecuenciaReportes")}
            />
          </Field>
          <Field label="Formato / canal" htmlFor="formatoCanal" nota={NOTAS["preferencias.trazabilidad.formatoCanal"]}>
            <TextInput id="formatoCanal" {...register("preferencias.trazabilidad.formatoCanal")} />
          </Field>
          <Field
            label="Contenido mínimo requerido"
            htmlFor="contenidoMinimo"
            className="sm:col-span-2"
            nota={NOTAS["preferencias.trazabilidad.contenidoMinimoRequerido"]}
          >
            <TextArea
              id="contenidoMinimo"
              {...register("preferencias.trazabilidad.contenidoMinimoRequerido")}
            />
          </Field>
          <Field label="Instructivo Odoo para el cliente" htmlFor="instructivoOdoo" className="sm:col-span-2" nota={NOTAS["preferencias.trazabilidad.instructivoOdooCliente"]}>
            <TextInput id="instructivoOdoo" {...register("preferencias.trazabilidad.instructivoOdooCliente")} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">
          4.2 Comunicación, tiempos de respuesta y escalamiento
        </h3>
        <div className="space-y-4">
          {OPCIONES_TIPO_COMUNICACION.map((tipo, index) => {
            const be = e?.comunicacion?.[index];
            const notaTipo = NOTAS_TIPO_COMUNICACION[index];
            return (
              <div key={tipo} className="rounded-lg border border-line bg-surface p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-ink">{tipo}</p>
                  {notaTipo && (
                    <details className="mt-1">
                      <summary className="flex w-fit cursor-pointer list-none select-none items-center gap-1 text-xs text-ink-muted hover:text-ink">
                        <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="8" cy="8" r="7" /><path d="M8 7v5M8 5.5v.5" strokeLinecap="round" />
                        </svg>
                        <span>Ver nota del formato</span>
                      </summary>
                      <p className="mt-1 border-l-2 border-primary/30 pl-2 text-xs text-ink-muted/80 whitespace-pre-line">{notaTipo}</p>
                    </details>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Canales preferidos" error={be?.canalesPreferidos?.message} nota={NOTAS["comunicacion.canalesPreferidos"]}>
                    <Select
                      options={OPCIONES_CANAL_ODOO}
                      {...register(`preferencias.comunicacion.${index}.canalesPreferidos`)}
                    />
                  </Field>
                  <Field label="Frecuencia" error={be?.frecuencia?.message} nota={NOTAS["comunicacion.frecuencia"]}>
                    <Select
                      options={OPCIONES_FRECUENCIA_COMUNICACION}
                      {...register(`preferencias.comunicacion.${index}.frecuencia`)}
                    />
                  </Field>
                  <Field label="Con copia a contactos internos" error={be?.conCopiaContactosInternos?.message} nota={NOTAS["comunicacion.conCopiaContactosInternos"]}>
                    <Controller
                      control={control}
                      name={`preferencias.comunicacion.${index}.conCopiaContactosInternos`}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
