// Notas del formato Excel (formato_SOP.xlsx) mapeadas a las rutas de los campos
// del formulario web. Se usan como prop `nota` en el componente Field para mostrar
// un tooltip colapsable con las instrucciones originales del formato.
export const NOTAS = {
  // --- Sección 1: Datos Generales ---
  "datosGenerales.cliente":
    "Completar: nombre o razón social del cliente tal como figura en el RUT / Cámara de Comercio.",
  "datosGenerales.nit":
    "Completar: NIT con dígito de verificación o documento de identificación del cliente.",
  "datosGenerales.sectorIndustria":
    "Completar: con el sector o industria con el cual se encuentra registrado el cliente en la herramienta LegisComex.",
  "datosGenerales.tipoOperacion":
    "Seleccionar de la lista desplegable: Importación, Exportación o Importación - Exportación.",
  "datosGenerales.tipoMercancia":
    "Completar: describir la mercancía (tipo de producto; naturaleza de la carga: general, refrigerada, peligrosa/IMO, extradimensionada; partida arancelaria si aplica).",
  "datosGenerales.serviciosContratados":
    "Seleccionar todos los servicios contratados. El 'Alcance del SOP' se actualiza automáticamente según los servicios seleccionados.",
  "datosGenerales.direccionPrincipal":
    "Completar: dirección principal del cliente (sede administrativa o planta desde donde se coordina la operación).",
  "datosGenerales.ciudad":
    "Completar: país y ciudad de la dirección principal.",
  "datosGenerales.fechaImplementacion":
    "Completar: fecha (dd/mm/aaaa) en la que el SOP entra en operación con el cliente.",

  // --- Sección 2: Resumen Ejecutivo ---
  "resumenEjecutivo.resumenNegocioCliente":
    "Completar: descripción breve del negocio del cliente: actividad, productos, mercados u orígenes/destinos, volúmenes estimados y estacionalidad.",
  "resumenEjecutivo.riesgosCriticosAlertas":
    "Completar: riesgos o alertas que puedan afectar la operación (carga sensible, restricciones de seguridad, ventanas de entrega, exigencias del cliente final, etc.).",
  "resumenEjecutivo.requiereAtencion247":
    'Seleccionar Sí / No / N/A en la celda inferior. Marcar "Sí" solo si el cliente exige disponibilidad operativa 24/7.',
  "resumenEjecutivo.requiereReunionesKPI":
    "Seleccionar Sí / No / N/A. Indica si se acordaron comités periódicos de revisión de KPI con el cliente.",
  "resumenEjecutivo.periodicidadRevisionSOP":
    "Seleccionar de la lista la periodicidad de revisión y actualización de este SOP (mensual, trimestral, semestral o anual).",
  "resumenEjecutivo.nivelCliente":
    "Seleccionar el nivel del cliente (Nivel 1, 2 o 3) según la clasificación comercial vigente (Por parte de Turinza).",

  // --- Sección 3: Contactos ---
  "contactos.internos":
    "Registrar los contactos de Turinza asignados a la cuenta: por cada área, nombre y cargo, teléfono y correo del titular y de su back up. En 'Escalonamiento', registrar a quién acudir si el titular no responde en los tiempos acordados.",
  "contactos.cliente":
    "Registrar los contactos del cliente: por cada área, nombre y cargo, teléfono y correo del contacto operativo, su back up y el contacto de escalamiento.",

  // --- Sección 4: Preferencias ---
  "preferencias.trazabilidad.frecuenciaReportes":
    "Seleccionar de la lista la frecuencia con la que el cliente recibirá el status consolidado de sus embarques.",
  "preferencias.trazabilidad.formatoCanal":
    "Seleccionar el formato o canal por el cual se enviará el status al cliente.",
  "preferencias.trazabilidad.contenidoMinimoRequerido":
    "Completar: (p. ej. estado del envío, tiempos estimados, KPI específicos).",
  "preferencias.trazabilidad.instructivoOdooCliente":
    "Indicar si se entregó al cliente el instructivo de consulta y seguimiento en Odoo (Sí / No y/o fecha de entrega).",

  // Descripciones de los tipos de comunicación (notas de la col B)
  "comunicacion.informativa":
    "Es una comunicación cuyo propósito es mantener informado al cliente sobre el desarrollo normal de su operación.\nEj: Confirmación de booking · Confirmación de embarque · Zarpe del buque · Arribo al puerto · Nacionalización iniciada · Mercancía liberada · Entrega programada · Recepción documental · Confirmación de pago",
  "comunicacion.preventiva":
    "Es una comunicación que informa un riesgo identificado que todavía puede evitarse si se toman acciones oportunamente.\nEj: Falta documentación · Documentos con errores · Próximo vencimiento de free time · Riesgo de demoras · Riesgo de abandono · Riesgo de inspección · Riesgo climático · Posible congestión portuaria · Posible retraso del buque · Pendiente aprobación del cliente",
  "comunicacion.alertas":
    "Es una comunicación de mayor criticidad que informa una desviación materializada o un riesgo crítico que afecta la operación.\nEj: Demoras (Demurrage) · Sobreestadías (Detention) · Roll Over confirmado · Contenedor retenido · Inspección DIAN · Incautación · Daño de mercancía · Pérdida documental · Omisión de embarque · Incumplimiento de ETA · Bloqueo operativo · Rechazo documental · Contenedor abandonado",

  // Campos de cada bloque de comunicación (notas de cols E, H, L)
  "comunicacion.canalesPreferidos":
    "Seleccionar el canal preferido por el cliente para cada tipo de comunicación.",
  "comunicacion.frecuencia":
    "Completar: frecuencia acordada para este tipo de comunicación (p. ej. en cada hito, diaria, inmediata al evento).",
  "comunicacion.conCopiaContactosInternos":
    "Completar: contactos del cliente que deben ir en copia en este tipo de comunicación.",

  // --- Sección 5: Matriz de Procesos ---
  "matrizProcesos.aplica":
    "Seleccionar Sí / No / N/A para indicar si el proceso aplica a este cliente.",
  "matrizProcesos.actividadHito":
    "Completar: actividades o hitos clave del proceso (recepción de solicitud, recogida, zarpe, nacionalización, entrega, etc.).",
  "matrizProcesos.personalizacionAcordada":
    "Completar: acuerdos particulares con el cliente que modifican el procedimiento estándar (documentos, horarios, autorizaciones, formatos propios, etc.).",
  "matrizProcesos.responsable":
    "Seleccionar de la lista el área responsable de la actividad.",
  "matrizProcesos.slaTiempo":
    'Completar: tiempo máximo de ejecución o respuesta acordado (SLA). Ej.: "24 h", "mismo día", "2 días hábiles".',
  "matrizProcesos.kpiAsociado":
    'Completar: KPI con el que se medirá la actividad. El indicador debe quedar definido en la hoja "Matriz KPI".',
  "matrizProcesos.controlEvidencia":
    "Completar: registro o evidencia que soporta el cumplimiento (correo, checklist, reporte Odoo, acta, etc.).",

  // --- Sección 6: Interacción con otras áreas ---
  "interaccionAreas.reglaCondicionAcordada":
    "Completar: regla o condición acordada con cada área (condiciones de crédito, tarifas, requisitos de facturación, aprobaciones, etc.).",
  "interaccionAreas.impactoOperativo":
    "Completar: cómo afecta esta condición la operación diaria (p. ej.: no se libera despacho sin pago; facturación quincenal consolidada).",

  // --- Sección 7: Cumplimiento normativo ---
  "cumplimiento.aplica":
    "Seleccionar Sí / No / N/A según aplique el requisito para este cliente.",
  "cumplimiento.detalleEvidenciaControl":
    "Completar: detalle del requisito, evidencia que lo soporta (certificado, póliza, procedimiento) y control asociado.",
  "cumplimiento.responsable":
    "Seleccionar: Nombre del área responsable del requisito.",

  // --- Sección 8: Riesgos ---
  "riesgos.riesgoCambioIdentificado":
    "Completar: describir el riesgo operativo o el cambio identificado en la operación del cliente.",
  "riesgos.impacto":
    "Completar: consecuencia si el riesgo se materializa (sobrecostos, demoras, sanciones, pérdida o daño de la carga, etc.).",
  "riesgos.accionCorrectiva":
    "Completar: acción definida para prevenir o mitigar el riesgo.",
  "riesgos.responsable":
    "Seleccionar: Nombre del área donde se identificó el riesgo.",

  // --- Sección 9: Aprobaciones ---
  "aprobaciones.observaciones":
    "Completar: observaciones generales, acuerdos adicionales o aclaraciones no cubiertos en las secciones anteriores.",
  "aprobaciones.revisoCliente":
    "Completar nombres y cargos de quien revisa por parte del cliente. El SOP entra en vigencia una vez aprobado por ambas partes y se archiva como documento controlado del SIG.",
  "aprobaciones.aproboCliente":
    "Completar nombres y cargos de quien aprueba por parte del cliente. El SOP entra en vigencia una vez aprobado por ambas partes y se archiva como documento controlado del SIG.",
} as const;

export type NotaKey = keyof typeof NOTAS;
