import { z } from "zod";
import {
  OPCIONES_AREA_RESPONSABLE,
  OPCIONES_CANAL_ODOO,
  OPCIONES_ESTADO_DOCUMENTO,
  OPCIONES_FRECUENCIA_COMUNICACION,
  OPCIONES_FRECUENCIA_CORTA,
  OPCIONES_FRECUENCIA_LARGA,
  OPCIONES_MODO_TRANSPORTE,
  OPCIONES_NIVEL_CLIENTE,
  OPCIONES_PRIORIDAD,
  OPCIONES_SI_NO_NA,
  OPCIONES_TIPO_OPERACION,
} from "./options";

const REQUERIDO = "Campo requerido";

/**
 * Los campos de selección se validan como `string` (no `z.enum`) a propósito: un
 * <select>/radio nativo siempre arranca en "" y debe poder representarse así mientras el
 * usuario no responde. `opcionRequerida`/`opcionOpcional` validan que, de tener valor, sea
 * una de las opciones de la lista — manteniendo el tipo de salida (`z.infer`) igual al
 * estado del formulario que usa react-hook-form, sin un tipo "borrador" paralelo.
 */
const opcionRequerida = (valores: readonly string[], mensaje = REQUERIDO) =>
  z
    .string()
    .min(1, mensaje)
    .refine((v) => (valores as readonly string[]).includes(v), { message: "Selecciona una opción válida" });

const opcionOpcional = (valores: readonly string[]) =>
  z
    .string()
    .refine((v) => v === "" || (valores as readonly string[]).includes(v), {
      message: "Selecciona una opción válida",
    });

// Filas fijas de las tablas de la Matriz de Contactos (Sección 3).
export const AREAS_CONTACTO = [
  "Operaciones / Logística",
  "Contabilidad / Facturación",
  "Tesorería / Pagos",
  "Calidad / Servicio al cliente",
] as const;

// Filas fijas de la Matriz de Procesos y Personalizaciones (Sección 5).
export const PROCESOS_OPERATIVOS = [
  "Transporte nacional",
  "Transporte internacional",
  "Agenciamiento aduanero",
  "Almacenamiento / Bodega",
  "OTM / DTA",
] as const;

// Filas fijas de Interacción con otras áreas (Sección 6).
export const AREAS_INTERACCION = [
  "Comercial / Pricing",
  "Facturación & Cartera",
  "Crédito / Riesgo",
  "Gerencia / Dirección",
] as const;

// Filas fijas de Cumplimiento normativo (Sección 7).
export const REQUISITOS_CUMPLIMIENTO = [
  "BASC",
  "OEA",
  "Seguro especial de mercancía",
  "Auditorías especiales del cliente",
  "Requisito documental adicional",
  "Otro requisito especial",
] as const;

const contactoSchema = z.object({
  nombreCargo: z.string().min(1, REQUERIDO),
  telefono: z.string().min(7, "Teléfono inválido"),
  correo: z.string().email("Correo inválido"),
});

const contactoDepartamentoSchema = contactoSchema.extend({
  area: z.string(),
});

const tablaContactosSchema = z.object({
  departamentos: z.array(contactoDepartamentoSchema).length(AREAS_CONTACTO.length),
  escalonamiento: contactoSchema,
});

export const matrizContactosSchema = z.object({
  internos: tablaContactosSchema,
  cliente: tablaContactosSchema,
});

export const datosGeneralesSchema = z.object({
  cliente: z.string().min(1, REQUERIDO),
  nit: z.string().min(1, REQUERIDO),
  sectorIndustria: z.string(),
  tipoOperacion: opcionRequerida(OPCIONES_TIPO_OPERACION),
  tipoMercancia: opcionRequerida(OPCIONES_MODO_TRANSPORTE),
  serviciosContratados: z.array(z.string()).min(1, "Selecciona al menos un servicio"),
  direccionPrincipal: z.string().min(1, REQUERIDO),
  paisCiudad: z.string().min(1, REQUERIDO),
  fechaImplementacion: z.string().min(1, REQUERIDO),
  objetivoSOP: z.string().min(1, REQUERIDO),
  alcanceSOP: z.string().min(1, REQUERIDO),
});

export const resumenEjecutivoSchema = z.object({
  resumenNegocioCliente: z.string(),
  riesgosCriticosAlertas: z.string(),
  requiereAtencion247: opcionRequerida(OPCIONES_SI_NO_NA),
  requiereReunionesKPI: opcionRequerida(OPCIONES_SI_NO_NA),
  periodicidadRevisionSOP: opcionRequerida(OPCIONES_FRECUENCIA_LARGA),
  nivelCliente: opcionRequerida(OPCIONES_NIVEL_CLIENTE),
});

const trazabilidadSchema = z.object({
  frecuenciaReportes: opcionRequerida(OPCIONES_FRECUENCIA_COMUNICACION),
  formatoCanal: z.string(),
  contenidoMinimoRequerido: z.string(),
  instructivoOdooCliente: z.string(),
});

const comunicacionBloqueSchema = z.object({
  tipo: z.string(),
  canalesPreferidos: opcionRequerida(OPCIONES_CANAL_ODOO),
  frecuencia: opcionRequerida(OPCIONES_FRECUENCIA_COMUNICACION),
  conCopiaContactosInternos: opcionRequerida(OPCIONES_SI_NO_NA),
});

export const preferenciasSchema = z.object({
  trazabilidad: trazabilidadSchema,
  comunicacion: z.array(comunicacionBloqueSchema),
});

// "Responsable" solo es obligatorio cuando "Aplica" = Sí: si el proceso no aplica
// (No / N/A), no tiene sentido exigir el resto de la fila.
const procesoSchema = z
  .object({
    proceso: z.string(),
    aplica: opcionRequerida(OPCIONES_SI_NO_NA),
    actividadHito: z.string(),
    personalizacionAcordada: z.string(),
    responsable: z.string(),
    slaTiempo: opcionOpcional(OPCIONES_FRECUENCIA_CORTA),
    kpiAsociado: z.string(),
    controlEvidencia: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.aplica === "Sí" && !val.responsable) {
      ctx.addIssue({ code: "custom", path: ["responsable"], message: REQUERIDO });
    }
  });

export const matrizProcesosSchema = z.array(procesoSchema);

const interaccionAreaSchema = z.object({
  area: z.string(),
  reglaCondicionAcordada: z.string(),
  impactoOperativo: z.string(),
  observaciones: z.string(),
});

export const interaccionAreasSchema = z.array(interaccionAreaSchema);

// Mismo criterio que en la Matriz de Procesos: "Responsable" solo es obligatorio
// cuando "¿Aplica?" = Sí.
const requisitoCumplimientoSchema = z
  .object({
    requisito: z.string(),
    aplica: opcionRequerida(OPCIONES_SI_NO_NA),
    detalleEvidenciaControl: z.string(),
    responsable: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.aplica === "Sí" && !val.responsable) {
      ctx.addIssue({ code: "custom", path: ["responsable"], message: REQUERIDO });
    }
  });

export const cumplimientoSchema = z.array(requisitoCumplimientoSchema);

const riesgoSchema = z.object({
  riesgoCambioIdentificado: z.string().min(1, REQUERIDO),
  impacto: opcionRequerida(OPCIONES_PRIORIDAD),
  accionCorrectiva: z.string(),
  responsable: opcionRequerida(OPCIONES_AREA_RESPONSABLE),
  eficacia: z.string(),
});

export const riesgosSchema = z.array(riesgoSchema).min(1, "Agrega al menos un riesgo");

const firmaSchema = z.object({
  nombre: z.string().min(1, REQUERIDO),
  cargo: z.string().min(1, REQUERIDO),
});

export const aprobacionesSchema = z.object({
  observaciones: z.string(),
  revisoCliente: firmaSchema,
  aproboCliente: firmaSchema,
  revisoTurinza: firmaSchema,
  aproboTurinza: firmaSchema,
});

export const sopFormSchema = z.object({
  datosGenerales: datosGeneralesSchema,
  resumenEjecutivo: resumenEjecutivoSchema,
  contactos: matrizContactosSchema,
  preferencias: preferenciasSchema,
  matrizProcesos: matrizProcesosSchema,
  interaccionAreas: interaccionAreasSchema,
  cumplimiento: cumplimientoSchema,
  riesgos: riesgosSchema,
  aprobaciones: aprobacionesSchema,
});

export type SopFormValues = z.infer<typeof sopFormSchema>;
export type DatosGenerales = z.infer<typeof datosGeneralesSchema>;
export type ResumenEjecutivo = z.infer<typeof resumenEjecutivoSchema>;
export type Contacto = z.infer<typeof contactoSchema>;
export type ContactoDepartamento = z.infer<typeof contactoDepartamentoSchema>;
export type TablaContactos = z.infer<typeof tablaContactosSchema>;
export type MatrizContactos = z.infer<typeof matrizContactosSchema>;
export type Trazabilidad = z.infer<typeof trazabilidadSchema>;
export type ComunicacionBloque = z.infer<typeof comunicacionBloqueSchema>;
export type Preferencias = z.infer<typeof preferenciasSchema>;
export type ProcesoOperativo = z.infer<typeof procesoSchema>;
export type InteraccionArea = z.infer<typeof interaccionAreaSchema>;
export type RequisitoCumplimiento = z.infer<typeof requisitoCumplimientoSchema>;
export type Riesgo = z.infer<typeof riesgoSchema>;
export type Firma = z.infer<typeof firmaSchema>;
export type Aprobaciones = z.infer<typeof aprobacionesSchema>;

// Hojas "Matriz KPI" y "Control de Cambios": registros internos de Turinza, fuera del
// flujo de llenado del cliente (secciones 1-9). Se modelan para uso futuro en el
// dashboard interno (Fase 7) y el registro automático de cambios (Fase 6).
const kpiClienteSchema = z.object({
  servicio: z.string().min(1, REQUERIDO),
  indicador: z.string().min(1, REQUERIDO),
  descripcion: z.string().optional(),
  meta: z.string().optional(),
  frecuencia: opcionRequerida(OPCIONES_FRECUENCIA_LARGA),
  fuente: z.string().optional(),
  responsable: opcionRequerida(OPCIONES_AREA_RESPONSABLE),
  observaciones: z.string().optional(),
});

export const matrizKpiSchema = z.array(kpiClienteSchema);
export type KpiCliente = z.infer<typeof kpiClienteSchema>;

const cambioControlSchema = z.object({
  version: z.string().min(1, REQUERIDO),
  fecha: z.string().min(1, REQUERIDO),
  seccionModificada: z.string().min(1, REQUERIDO),
  descripcionCambio: z.string().min(1, REQUERIDO),
  motivo: z.string().optional(),
  solicitadoPor: z.string().optional(),
  responsable: opcionRequerida(OPCIONES_AREA_RESPONSABLE),
  aprobadoPor: z.string().optional(),
  estado: opcionRequerida(OPCIONES_ESTADO_DOCUMENTO),
});

export const controlCambiosSchema = z.array(cambioControlSchema);
export type CambioControl = z.infer<typeof cambioControlSchema>;
