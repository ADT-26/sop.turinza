"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionCard, Stepper } from "@/components/ui";
import { sopFormSchema, type SopFormValues } from "@/lib/schemas";
import { SECTIONS, SECTION_KEYS } from "@/lib/formSections";
import { Section1DatosGenerales } from "@/components/sections/Section1DatosGenerales";
import { Section2ResumenEjecutivo } from "@/components/sections/Section2ResumenEjecutivo";
import { Section3Contactos } from "@/components/sections/Section3Contactos";
import { Section4Preferencias } from "@/components/sections/Section4Preferencias";
import { Section5MatrizProcesos } from "@/components/sections/Section5MatrizProcesos";
import { Section6Interaccion } from "@/components/sections/Section6Interaccion";
import { Section7Cumplimiento } from "@/components/sections/Section7Cumplimiento";
import { Section8Riesgos } from "@/components/sections/Section8Riesgos";
import { Section9Aprobaciones } from "@/components/sections/Section9Aprobaciones";
import { ResumenFinal } from "@/components/form/ResumenFinal";

// Permite al administrador corregir, desde el panel interno, los datos que
// diligenció el cliente en las 9 secciones del formulario público. Reutiliza
// los mismos componentes de sección que SopForm (misma validación, mismas
// listas), pero sin borrador en localStorage ni descarga automática de
// Excel — el admin ya tiene el botón "Descargar Excel" en el detalle.
export function EditarSopForm({ id, valoresIniciales }: { id: string; valoresIniciales: SopFormValues }) {
  const router = useRouter();
  const methods = useForm<SopFormValues>({
    resolver: zodResolver(sopFormSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });
  const { handleSubmit, trigger, formState } = methods;
  const [step, setStep] = useState(0);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const isFirst = step === 0;
  const isLast = step === SECTIONS.length - 1;

  const irSiguiente = async () => {
    const valido = await trigger(SECTION_KEYS[step]);
    if (valido) setStep((s) => Math.min(SECTIONS.length - 1, s + 1));
  };

  const onSubmit = async (data: SopFormValues) => {
    setErrorGuardado(null);
    setGuardadoOk(false);
    try {
      const respuesta = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await respuesta.json();
      if (!respuesta.ok || !json.success) {
        throw new Error(json.error ?? "Error al guardar los cambios");
      }
      setGuardadoOk(true);
      router.push(`/dashboard/${id}`);
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : "Error al guardar los cambios");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span className="font-mono uppercase tracking-wide">
            Paso {step + 1} / {String(SECTIONS.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/${id}`)}
            className="font-medium text-ink-muted hover:underline"
          >
            Cancelar y volver al detalle
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden bg-line">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}
          />
        </div>

        <Stepper steps={SECTIONS} current={step} onStepClick={setStep} />

        <SectionCard index={step + 1} title={SECTIONS[step]}>
          {step === 0 && <Section1DatosGenerales />}
          {step === 1 && <Section2ResumenEjecutivo />}
          {step === 2 && <Section3Contactos />}
          {step === 3 && <Section4Preferencias />}
          {step === 4 && <Section5MatrizProcesos />}
          {step === 5 && <Section6Interaccion />}
          {step === 6 && <Section7Cumplimiento />}
          {step === 7 && <Section8Riesgos />}
          {step === 8 && (
            <div className="space-y-6">
              <Section9Aprobaciones />
              <ResumenFinal />
            </div>
          )}
        </SectionCard>

        {errorGuardado && (
          <p role="alert" className="rounded-md border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
            {errorGuardado}
          </p>
        )}
        {guardadoOk && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Cambios guardados.
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-muted disabled:opacity-40"
          >
            Anterior
          </button>
          {isLast ? (
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
            >
              {formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          ) : (
            <button
              type="button"
              onClick={irSiguiente}
              className="rounded-md bg-primary-dark px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark/90"
            >
              Siguiente
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
