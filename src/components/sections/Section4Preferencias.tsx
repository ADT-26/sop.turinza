"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, TextInput, TextArea, Select, RadioGroup } from "@/components/ui";
import {
  OPCIONES_CANAL_ODOO,
  OPCIONES_FRECUENCIA_COMUNICACION,
  OPCIONES_SI_NO_NA,
  OPCIONES_TIPO_COMUNICACION,
} from "@/lib/options";
import type { SopFormValues } from "@/lib/schemas";

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
          >
            <Select
              id="frecuenciaReportes"
              options={OPCIONES_FRECUENCIA_COMUNICACION}
              {...register("preferencias.trazabilidad.frecuenciaReportes")}
            />
          </Field>
          <Field label="Formato / canal" htmlFor="formatoCanal">
            <TextInput id="formatoCanal" {...register("preferencias.trazabilidad.formatoCanal")} />
          </Field>
          <Field
            label="Contenido mínimo requerido"
            htmlFor="contenidoMinimo"
            hint="Ej. estado del envío, tiempos estimados, KPI específicos"
            className="sm:col-span-2"
          >
            <TextArea
              id="contenidoMinimo"
              {...register("preferencias.trazabilidad.contenidoMinimoRequerido")}
            />
          </Field>
          <Field label="Instructivo Odoo para el cliente" htmlFor="instructivoOdoo" className="sm:col-span-2">
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
            return (
              <div key={tipo} className="rounded-lg border border-line bg-surface p-4">
                <p className="mb-3 text-sm font-medium text-ink">{tipo}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Canales preferidos" error={be?.canalesPreferidos?.message}>
                    <Select
                      options={OPCIONES_CANAL_ODOO}
                      {...register(`preferencias.comunicacion.${index}.canalesPreferidos`)}
                    />
                  </Field>
                  <Field label="Frecuencia" error={be?.frecuencia?.message}>
                    <Select
                      options={OPCIONES_FRECUENCIA_COMUNICACION}
                      {...register(`preferencias.comunicacion.${index}.frecuencia`)}
                    />
                  </Field>
                  <Field label="Con copia a contactos internos" error={be?.conCopiaContactosInternos?.message}>
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
