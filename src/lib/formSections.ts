import type { SopFormValues } from "./schemas";

// Pasos del formulario, compartidos entre el wizard público del cliente
// (SopForm) y el editor del panel admin (EditarSopForm) para que ambos
// muestren siempre las mismas 9 secciones en el mismo orden.
export const SECTIONS = [
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

export const SECTION_KEYS = [
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
