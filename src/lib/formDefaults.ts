import { AREAS_CONTACTO, AREAS_INTERACCION, PROCESOS_OPERATIVOS, REQUISITOS_CUMPLIMIENTO } from "./schemas";
import { OPCIONES_TIPO_COMUNICACION } from "./options";
import type { Contacto, Riesgo, SopFormValues, TablaContactos } from "./schemas";

// Objetivo y Alcance del SOP son texto fijo del formato — el cliente no los
// diligencia. Se exportan también desde aquí para que el Excel y el panel
// admin los muestren siempre, sin depender de lo que traiga el registro
// guardado (p. ej. borradores o registros de prueba anteriores a este texto).
export const OBJETIVO_SOP_DEFAULT =
  "Describir el Procedimiento Operativo Estándar (SOP) para la prestación de servicios logísticos integrales al Cliente, estableciendo lineamientos y métodos de trabajo que garantizan un servicio consistente, personalizado y eficiente.";
export const ALCANCE_SOP_DEFAULT =
  "Este SOP aplica a todos los servicios contratados por el cliente.";

// Texto de alcance por servicio (igual que en formato_SOP.xlsx).
// Se concatena uno por línea según los servicios seleccionados.
export const ALCANCE_POR_SERVICIO: Record<string, string> = {
  "OTM / DTA":
    "DTA/OTM: Cubre desde la recepción de solicitud del cliente hasta el descargue de la mercancía y liberación de documentos del embarque en el deposito indicado en el documento de transporte.",
  "Transporte terrestre":
    "Transporte terrestre: Cubre desde la recepción de solicitud del cliente hasta el descargue de la mercancía en el destino final acordado previamente.",
  "Transporte internacional":
    "Transporte internacional: Cubre desde la recepción de solicitudes del cliente hasta la entrega de documentos liberados a quien el cliente autorice.",
  "Aduanas":
    "Aduanas: Cubre desde la recepción de solicitud del cliente hasta el levante de la mercancía otorgado por la autoridad aduanera DIAN.",
  "Almacenamiento / Bodega":
    "Bodega: Cubre desde la recepción de solicitud del cliente hasta el cargue y salida de la mercancía.",
};

const crearContactoVacio = (): Contacto => ({ nombreCargo: "", telefono: "", correo: "" });

const crearTablaContactosVacia = (): TablaContactos => ({
  departamentos: AREAS_CONTACTO.map((area) => ({ area, backus: "", ...crearContactoVacio() })),
  escalonamiento: crearContactoVacio(),
});

export const crearRiesgoVacio = (): Riesgo => ({
  riesgoCambioIdentificado: "",
  impacto: "",
  accionCorrectiva: "",
  responsable: "",
  eficacia: "",
});

export function crearSopFormVacio(): SopFormValues {
  return {
    datosGenerales: {
      cliente: "",
      nit: "",
      sectorIndustria: "",
      tipoOperacion: "",
      tipoMercancia: "",
      serviciosContratados: [],
      direccionPrincipal: "",
      pais: "",
      ciudad: "",
      fechaImplementacion: "",
      objetivoSOP: OBJETIVO_SOP_DEFAULT,
      alcanceSOP: ALCANCE_SOP_DEFAULT,
    },
    resumenEjecutivo: {
      resumenNegocioCliente: "",
      riesgosCriticosAlertas: "",
      requiereAtencion247: "",
      requiereReunionesKPI: "",
      requiereReunionOperativaSemanal: "",
      asistentesReunionOperativa: "",
      periodicidadRevisionSOP: "",
      nivelCliente: "",
    },
    contactos: {
      internos: crearTablaContactosVacia(),
      cliente: crearTablaContactosVacia(),
    },
    preferencias: {
      trazabilidad: {
        frecuenciaReportes: "",
        formatoCanal: "Sistema Odoo",
        contenidoMinimoRequerido: "",
        instructivoOdooCliente: "",
      },
      comunicacion: OPCIONES_TIPO_COMUNICACION.map((tipo) => ({
        tipo,
        canalesPreferidos: "",
        frecuencia: "",
        conCopiaContactosInternos: "",
      })),
    },
    matrizProcesos: PROCESOS_OPERATIVOS.map((proceso) => ({
      proceso,
      aplica: "No",
      actividadHito: "",
      personalizacionAcordada: "",
      responsable: "",
      slaTiempo: "",
      kpiAsociado: "",
      controlEvidencia: "",
    })),
    interaccionAreas: AREAS_INTERACCION.map((area) => ({
      area,
      reglaCondicionAcordada: "",
      impactoOperativo: "",
      observaciones: "",
    })),
    cumplimiento: REQUISITOS_CUMPLIMIENTO.map((requisito) => ({
      requisito,
      aplica: "No",
      detalleEvidenciaControl: "",
      responsable: "",
    })),
    riesgos: [crearRiesgoVacio()],
    aprobaciones: {
      observaciones: "",
      revisoCliente: { nombre: "", cargo: "" },
      aproboCliente: { nombre: "", cargo: "" },
      revisoTurinzaComercial: { nombre: "", cargo: "" },
      revisoTurinza: { nombre: "", cargo: "" },
      aproboTurinza: { nombre: "", cargo: "" },
    },
  };
}
