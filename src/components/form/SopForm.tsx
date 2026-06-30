"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionCard, Stepper } from "@/components/ui";
import { crearSopFormVacio } from "@/lib/formDefaults";
import { sopFormSchema, type SopFormValues } from "@/lib/schemas";
import { Section1DatosGenerales } from "@/components/sections/Section1DatosGenerales";
import { Section2ResumenEjecutivo } from "@/components/sections/Section2ResumenEjecutivo";
import { Section3Contactos } from "@/components/sections/Section3Contactos";
import { Section4Preferencias } from "@/components/sections/Section4Preferencias";
import { Section5MatrizProcesos } from "@/components/sections/Section5MatrizProcesos";
import { Section6Interaccion } from "@/components/sections/Section6Interaccion";
import { Section7Cumplimiento } from "@/components/sections/Section7Cumplimiento";
import { Section8Riesgos } from "@/components/sections/Section8Riesgos";
import { Section9Aprobaciones } from "@/components/sections/Section9Aprobaciones";
import { ResumenFinal } from "./ResumenFinal";

const SECTIONS = [
  "Datos generales del cliente y del SOP",
  "Resumen ejecutivo del cliente",
  "Matriz de contactos",
  "Preferencias, protocolos y particularidades",
  "Matriz de procesos y personalizaciones operativas",
  "Interacción con otras áreas y condiciones comerciales",
  "Cumplimiento normativo y requisitos especiales",
  "Riesgos operativos y alertas",
  "Observaciones, validación y aprobaciones",
] as const;

const SECTION_KEYS = [
  "datosGenerales",
  "resumenEjecutivo",
  "contactos",
  "preferencias",
  "matrizProcesos",
  "interaccionAreas",
  "cumplimiento",
  "riesgos",
  "aprobaciones",
] as const satisfies readonly (keyof SopFormValues)[];

const BORRADOR_KEY = "sop-form-borrador";

export function SopForm() {
  const methods = useForm<SopFormValues>({
    resolver: zodResolver(sopFormSchema),
    defaultValues: crearSopFormVacio(),
    mode: "onBlur",
  });
  const { handleSubmit, trigger, watch, reset, formState } = methods;
  const [step, setStep] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [sopId, setSopId] = useState<number | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [guardadoEn, setGuardadoEn] = useState<Date | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const guardado = window.localStorage.getItem(BORRADOR_KEY);
    if (guardado) {
      try {
        reset(JSON.parse(guardado));
      } catch {
        // Borrador corrupto: se ignora y se mantiene el formulario vacío.
      }
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        window.localStorage.setItem(BORRADOR_KEY, JSON.stringify(value));
        setGuardadoEn(new Date());
      }, 600);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const isFirst = step === 0;
  const isLast = step === SECTIONS.length - 1;

  const irSiguiente = async () => {
    const valido = await trigger(SECTION_KEYS[step]);
    if (valido) setStep((s) => Math.min(SECTIONS.length - 1, s + 1));
  };

  const limpiarBorrador = () => {
    if (!window.confirm("¿Borrar todo el progreso guardado en este navegador?")) return;
    window.localStorage.removeItem(BORRADOR_KEY);
    reset(crearSopFormVacio());
    setStep(0);
    setGuardadoEn(null);
  };

  const onSubmit = async (data: SopFormValues) => {
    setErrorEnvio(null);
    try {
      const respuesta = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await respuesta.json();
      if (!respuesta.ok || !json.success) {
        throw new Error(json.error ?? "Error al enviar el formulario");
      }
      window.localStorage.removeItem(BORRADOR_KEY);
      setSopId(json.id);
      setEnviado(true);
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : "Error al enviar el formulario");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>
            Paso {step + 1} de {SECTIONS.length}
          </span>
          <div className="flex items-center gap-3">
            <span aria-live="polite">
              {guardadoEn && `Borrador guardado ${guardadoEn.toLocaleTimeString()}`}
            </span>
            <button
              type="button"
              onClick={limpiarBorrador}
              className="font-medium text-accent hover:underline"
            >
              Restablecer formulario
            </button>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}
          />
        </div>

        <Stepper steps={SECTIONS} current={step} onStepClick={setStep} />

        {enviado ? (
          <SectionCard index={9} title="Formulario enviado">
            <p className="text-sm text-ink">
              El SOP se guardó correctamente{sopId !== null && <> con el ID #{sopId}</>}. La
              exportación a OneDrive y el email de confirmación se habilitarán en la Fase 6.
            </p>
          </SectionCard>
        ) : (
          <>
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

            {errorEnvio && (
              <p
                role="alert"
                className="rounded-md border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent"
              >
                {errorEnvio}
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
                  {formState.isSubmitting ? "Enviando..." : "Enviar formulario"}
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
          </>
        )}
      </form>
    </FormProvider>
  );
}
