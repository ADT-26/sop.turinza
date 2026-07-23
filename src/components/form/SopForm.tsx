"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionCard, Stepper } from "@/components/ui";
import { crearSopFormVacio } from "@/lib/formDefaults";
import { sopFormSchema, type SopFormValues } from "@/lib/schemas";
import { SECTIONS, SECTION_KEYS } from "@/lib/formSections";
import { useScrollTopOnChange } from "@/lib/useScrollTopOnChange";
import { conDefectos } from "@/lib/formNormalizer";
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

const BORRADOR_KEY = "sop-form-borrador";

function base64AArchivo(base64: string, tipo: string): Blob {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}

const MIME_PDF = "application/pdf";

export function SopForm() {
  const methods = useForm<SopFormValues>({
    resolver: zodResolver(sopFormSchema),
    defaultValues: crearSopFormVacio(),
    mode: "onBlur",
  });
  const { handleSubmit, trigger, watch, reset, formState } = methods;
  const [step, setStep] = useState(0);
  useScrollTopOnChange(step);
  const [enviado, setEnviado] = useState(false);
  const [sopId, setSopId] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [guardadoEn, setGuardadoEn] = useState<Date | null>(null);
  const [descarga, setDescarga] = useState<{ url: string; nombre: string } | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (descarga) URL.revokeObjectURL(descarga.url);
    };
  }, [descarga]);

  useEffect(() => {
    const guardado = window.localStorage.getItem(BORRADOR_KEY);
    if (guardado) {
      try {
        // Normalizar el borrador contra la forma actual del formulario: si el
        // schema ganó un campo nuevo después de que el usuario guardó el borrador
        // (p. ej. "backus"), ese campo faltante quedaría undefined y bloquearía
        // la validación del paso sin mostrar ningún error visible.
        reset(conDefectos(JSON.parse(guardado), crearSopFormVacio()));
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

      if (json.pdfBase64) {
        const nombre = json.nombreArchivo || `SOP-${json.id}.pdf`;
        const blob = base64AArchivo(json.pdfBase64, MIME_PDF);
        const url = URL.createObjectURL(blob);
        setDescarga({ url, nombre });

        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombre;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
      }

      setEnviado(true);
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : "Error al enviar el formulario");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span className="font-mono uppercase tracking-wide">
            Paso {step + 1} / {String(SECTIONS.length).padStart(2, "0")}
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

        <div className="h-1 w-full overflow-hidden bg-line">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}
          />
        </div>

        <Stepper steps={SECTIONS} current={step} onStepClick={setStep} />

        {enviado ? (
          <SectionCard index={9} title="Formulario enviado">
            <div className="space-y-4">
              <p className="text-sm text-ink">
                El SOP se guardó correctamente
                {sopId !== null && (
                  <>
                    {" "}
                    (ID <span className="font-mono text-xs">{sopId}</span>)
                  </>
                )}
                .
              </p>
              {descarga ? (
                <div className="rounded-lg border border-line bg-surface p-4 text-sm">
                  <p className="text-ink-muted">
                    Deberíamos haber descargado automáticamente una copia en PDF con tus datos.
                    Si no pasó nada, descárgala manualmente:
                  </p>
                  <a
                    href={descarga.url}
                    download={descarga.nombre}
                    className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark/90"
                  >
                    Descargar copia en PDF
                  </a>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">
                  No se pudo generar la copia en PDF automáticamente, pero tus datos ya quedaron
                  guardados sin problema.
                </p>
              )}
            </div>
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
