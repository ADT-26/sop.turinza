import { AREAS_CONTACTO, AREAS_INTERACCION, PROCESOS_OPERATIVOS, REQUISITOS_CUMPLIMIENTO } from "./schemas";
import { OPCIONES_TIPO_COMUNICACION } from "./options";
import type { Contacto, Riesgo, SopFormValues, TablaContactos } from "./schemas";

const crearContactoVacio = (): Contacto => ({ nombreCargo: "", telefono: "", correo: "" });

const crearTablaContactosVacia = (): TablaContactos => ({
  departamentos: AREAS_CONTACTO.map((area) => ({ area, ...crearContactoVacio() })),
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
      paisCiudad: "",
      fechaImplementacion: "",
      objetivoSOP: "",
      alcanceSOP: "",
    },
    resumenEjecutivo: {
      resumenNegocioCliente: "",
      riesgosCriticosAlertas: "",
      requiereAtencion247: "",
      requiereReunionesKPI: "",
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
      revisoTurinza: { nombre: "", cargo: "" },
      aproboTurinza: { nombre: "", cargo: "" },
    },
  };
}
