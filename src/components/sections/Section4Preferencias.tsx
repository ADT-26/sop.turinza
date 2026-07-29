"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
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

function ComunicacionBloqueItem({ index, tipo, notaTipo }: { index: number; tipo: string; notaTipo?: string }) {
  const { register, control, formState: { errors } } = useFormContext<SopFormValues>();
  const be = errors.preferencias?.comunicacion?.[index];
  const conCopia = useWatch({ control, name: `preferencias.comunicacion.${index}.conCopiaContactosInternos` });

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
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
      {conCopia === "Sí" && (
        <div className="mt-4 grid gap-4 rounded-md border border-primary/20 bg-primary/5 p-3 sm:grid-cols-2">
          <Field label="Nombre del contacto" htmlFor={`copiaContactoNombre-${index}`}>
            <TextInput
              id={`copiaContactoNombre-${index}`}
              placeholder="Nombre completo"
              {...register(`preferencias.comunicacion.${index}.conCopiaContactoNombre`)}
            />
          </Field>
          <Field label="Correo / teléfono" htmlFor={`copiaContactoInfo-${index}`}>
            <TextInput
              id={`copiaContactoInfo-${index}`}
              placeholder="correo@empresa.com o +57 300..."
              {...register(`preferencias.comunicacion.${index}.conCopiaContactoInfo`)}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export function Section4Preferencias() {
  const {
    register,
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
            label="Frecuencia del status consolidado de embarques"
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
          <Field label="Formato / canal">
            <p className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-muted select-none">
              Correo - llamada
            </p>
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
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">
          4.2 Comunicación, tiempos de respuesta y escalamiento
        </h3>
        <div className="space-y-4">
          {OPCIONES_TIPO_COMUNICACION.map((tipo, index) => (
            <ComunicacionBloqueItem
              key={tipo}
              index={index}
              tipo={tipo}
              notaTipo={NOTAS_TIPO_COMUNICACION[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
