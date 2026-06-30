"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, TextInput, Select } from "@/components/ui";
import {
  CIUDADES_SUGERIDAS_COLOMBIA,
  OPCIONES_MODO_TRANSPORTE,
  OPCIONES_PAIS,
  OPCIONES_SERVICIOS,
  OPCIONES_TIPO_OPERACION,
} from "@/lib/options";
import type { SopFormValues } from "@/lib/schemas";

export function Section1DatosGenerales() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SopFormValues>();
  const e = errors.datosGenerales;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Cliente / Razón social" htmlFor="cliente" required error={e?.cliente?.message}>
          <TextInput id="cliente" {...register("datosGenerales.cliente")} />
        </Field>
        <Field label="NIT / ID" htmlFor="nit" required error={e?.nit?.message}>
          <TextInput id="nit" {...register("datosGenerales.nit")} />
        </Field>
        <Field label="Sector o Industria" htmlFor="sector">
          <TextInput id="sector" {...register("datosGenerales.sectorIndustria")} />
        </Field>
        <Field label="Tipo de operación" htmlFor="tipoOperacion" required error={e?.tipoOperacion?.message}>
          <Select
            id="tipoOperacion"
            options={OPCIONES_TIPO_OPERACION}
            {...register("datosGenerales.tipoOperacion")}
          />
        </Field>
        <Field label="Tipo de mercancía" htmlFor="tipoMercancia" required error={e?.tipoMercancia?.message}>
          <Select
            id="tipoMercancia"
            options={OPCIONES_MODO_TRANSPORTE}
            {...register("datosGenerales.tipoMercancia")}
          />
        </Field>
        <Field label="País" htmlFor="pais" required error={e?.pais?.message}>
          <Select id="pais" options={OPCIONES_PAIS} {...register("datosGenerales.pais")} />
        </Field>
        <Field label="Ciudad" htmlFor="ciudad" required error={e?.ciudad?.message}>
          <TextInput
            id="ciudad"
            list="ciudades-sugeridas"
            autoComplete="address-level2"
            {...register("datosGenerales.ciudad")}
          />
        </Field>
        <datalist id="ciudades-sugeridas">
          {CIUDADES_SUGERIDAS_COLOMBIA.map((ciudad) => (
            <option key={ciudad} value={ciudad} />
          ))}
        </datalist>
        <Field
          label="Dirección principal"
          htmlFor="direccion"
          required
          error={e?.direccionPrincipal?.message}
          className="sm:col-span-2"
        >
          <TextInput id="direccion" {...register("datosGenerales.direccionPrincipal")} />
        </Field>
        <Field
          label="Fecha de implementación del SOP"
          htmlFor="fechaImplementacion"
          required
          error={e?.fechaImplementacion?.message}
        >
          <TextInput id="fechaImplementacion" type="date" {...register("datosGenerales.fechaImplementacion")} />
        </Field>
      </div>

      <Field label="Servicios contratados" required error={e?.serviciosContratados?.message}>
        <Controller
          control={control}
          name="datosGenerales.serviciosContratados"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {OPCIONES_SERVICIOS.map((servicio) => {
                const checked = field.value.includes(servicio);
                return (
                  <label
                    key={servicio}
                    className={`cursor-pointer rounded-[4px] border px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-dark has-[:focus-visible]:ring-offset-2 ${
                      checked
                        ? "border-primary-dark bg-primary-dark text-white"
                        : "border-line bg-white text-ink-muted hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        field.onChange(
                          checked ? field.value.filter((s) => s !== servicio) : [...field.value, servicio],
                        )
                      }
                      className="sr-only"
                    />
                    {servicio}
                  </label>
                );
              })}
            </div>
          )}
        />
      </Field>
    </div>
  );
}
