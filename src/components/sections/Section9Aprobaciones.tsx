"use client";

import { useFormContext } from "react-hook-form";
import { Field, TextInput, TextArea } from "@/components/ui";
import type { SopFormValues } from "@/lib/schemas";

const BLOQUES = [
  { key: "revisoCliente", titulo: "Revisó Cliente" },
  { key: "aproboCliente", titulo: "Aprobó Cliente" },
  { key: "revisoTurinza", titulo: "Revisó Turinza" },
  { key: "aproboTurinza", titulo: "Aprobó Turinza" },
] as const;

export function Section9Aprobaciones() {
  const { register } = useFormContext<SopFormValues>();

  return (
    <div className="space-y-5">
      <Field label="Observaciones" htmlFor="observacionesFinales">
        <TextArea id="observacionesFinales" {...register("aprobaciones.observaciones")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {BLOQUES.map(({ key, titulo }) => (
          <div key={key} className="rounded-lg border border-line bg-surface p-4">
            <p className="mb-3 text-sm font-semibold text-ink">{titulo}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre">
                <TextInput {...register(`aprobaciones.${key}.nombre`)} />
              </Field>
              <Field label="Cargo">
                <TextInput {...register(`aprobaciones.${key}.cargo`)} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
