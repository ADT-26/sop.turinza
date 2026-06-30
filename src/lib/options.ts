/**
 * Las 12 listas desplegables definidas en la hoja "Listas" de formats/formato_SOP.xlsx.
 * Del Excel original, 6 de las 12 (FRECUENCIA_CORTA, MODO_TRANSPORTE, ESTADO_DOCUMENTO,
 * PRIORIDAD, SERVICIOS, TIPO_COMUNICACION) quedaron preparadas en la hoja "Listas" pero sin
 * conectar a ninguna celda vía validación de datos. Se conectan aquí a su campo más afín
 * (ver PLAN-IMPLEMENTACION.md, sección Fase 2) para que ninguna lista del formato se pierda.
 */

export const OPCIONES_SI_NO_NA = ["Sí", "No", "N/A"] as const;

export const OPCIONES_FRECUENCIA_CORTA = [
  "Diario",
  "Semanal",
  "Quincenal",
  "Mensual",
  "Por evento",
  "Tiempo real",
] as const;

export const OPCIONES_CANAL_ODOO = [
  "Correo - Odoo",
  "WhatsApp - Odoo",
  "Llamada - Odoo",
  "Teams - Odoo",
] as const;

export const OPCIONES_NIVEL_CLIENTE = ["Nivel 1", "Nivel 2", "Nivel 3"] as const;

export const OPCIONES_FRECUENCIA_LARGA = ["Mensual", "Trimestral", "Semestral", "Anual"] as const;

export const OPCIONES_TIPO_OPERACION = ["Importación", "Exportación", "Ambos"] as const;

export const OPCIONES_MODO_TRANSPORTE = ["Marítimo", "Aéreo", "Terrestre", "Multimodal"] as const;

export const OPCIONES_ESTADO_DOCUMENTO = ["Abierto", "En revisión", "Obsoleto", "Aprobado"] as const;

export const OPCIONES_PRIORIDAD = ["Alta", "Media", "Baja"] as const;

export const OPCIONES_AREA_RESPONSABLE = [
  "Comercial",
  "Operaciones",
  "Customer Service / KAS",
  "Facturación",
  "Almacenamiento / Bodega",
  "Calidad",
  "Gerencia",
] as const;

export const OPCIONES_SERVICIOS = [
  "OTM / DTA",
  "Transporte nacional",
  "Transporte internacional",
  "Aduanas",
  "Almacenamiento / Bodega",
] as const;

export const OPCIONES_FRECUENCIA_COMUNICACION = ["1 por semana", "2 por semana", "Quincenal"] as const;

export const OPCIONES_TIPO_COMUNICACION = ["Informativa", "Preventiva", "Alertas"] as const;
