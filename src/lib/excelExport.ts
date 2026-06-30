import path from "node:path";
import fs from "node:fs/promises";
import ExcelJS from "exceljs";
import type { SopFormValues } from "./schemas";
import { ALCANCE_SOP_DEFAULT, OBJETIVO_SOP_DEFAULT } from "./formDefaults";

const TEMPLATE_PATH = path.join(process.cwd(), "formats", "formato_SOP.xlsx");
const LOGO_PATH = path.join(process.cwd(), "public", "logo_turinza.png");

// Filas fijas de cada bloque repetible en la hoja "SOP" del template real
// (ver formats/formato_SOP.xlsx). Cada arreglo dinámico del formulario web
// se vuelca sobre estas filas, en el mismo orden en que aparecen ahí.
const FILAS_CONTACTO = { internos: [27, 28, 29, 30], cliente: [36, 37, 38, 39] } as const;
const FILAS_COMUNICACION = [51, 54, 57] as const; // Informativa, Preventiva, Alertas
const FILAS_PROCESO = [62, 66, 70, 74, 78] as const; // primera fila de cada bloque de 4
const FILAS_INTERACCION = [85, 86, 87, 88] as const;
const FILAS_CUMPLIMIENTO = [92, 93, 94, 95, 96, 97] as const;
const FILAS_RIESGO = [102, 103, 104, 105, 106] as const; // la plantilla solo trae 5 filas

export async function generarExcelSop(data: SopFormValues): Promise<Buffer> {
  const buffer = await fs.readFile(TEMPLATE_PATH);
  const workbook = new ExcelJS.Workbook();
  // exceljs tipa `load` contra una versión más vieja de los tipos de Buffer de Node;
  // en tiempo de ejecución es exactamente un Buffer, el cast solo evita el desfase de tipos.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  // El template trae 3 "Tablas" de Excel (en hojas que no tocamos: Listas,
  // Matriz KPI, Control de Cambios) sin ninguna validación de datos ni fórmula
  // que dependa de ellas. exceljs no las serializa de forma 100% fiel al
  // reescribir el archivo, lo que hace que Excel marque el .xlsx como dañado
  // y tenga que "reparar" quitándoles el autofiltro. Se eliminan aquí (solo
  // se pierde el botón de filtro de esas tablas; el contenido y formato
  // quedan intactos) para evitar la advertencia de archivo dañado.
  workbook.worksheets.forEach((ws) => {
    // El tipo de getTables() en @types/exceljs ("[Table, void][]") no coincide con
    // lo que devuelve en tiempo de ejecución (Table[], ver node_modules/exceljs/lib/doc/worksheet.js).
    const tablas = ws.getTables() as unknown as ExcelJS.Table[];
    tablas.forEach((table) => ws.removeTable(table.name));
  });

  const sheet = workbook.getWorksheet("SOP");
  if (!sheet) throw new Error("La plantilla no tiene una hoja llamada 'SOP'");

  // El logo del header (celda combinada B2:C2 en el template) viene roto en
  // el archivo original (#VALUE!); se reemplaza por el logo real de Turinza.
  sheet.getCell("B2").value = null;
  const logoBuffer = await fs.readFile(LOGO_PATH);
  // Mismo desfase de tipos de Buffer entre exceljs y la versión de @types/node del proyecto
  // que en `workbook.xlsx.load` más arriba; en tiempo de ejecución es un Buffer válido.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logoImageId = workbook.addImage({ buffer: logoBuffer as any, extension: "png" });

  // Ancla el logo por tamaño (no por rango B2:C2) para no deformar su proporción:
  // "B2:C2" estiraría la imagen a la forma exacta de la celda combinada.
  const LOGO_RATIO = 952 / 319; // dimensiones reales de public/logo_turinza.png
  const colWidthPx = (chars: number) => chars * 7 + 5; // aproximación estándar de Excel
  const cellWidthPx =
    colWidthPx(sheet.getColumn("B").width ?? 8) + colWidthPx(sheet.getColumn("C").width ?? 17);
  const cellHeightPx = ((sheet.getRow(2).height ?? 67.5) * 4) / 3; // puntos -> píxeles
  const margin = 6;
  let width = cellWidthPx - margin * 2;
  let height = width / LOGO_RATIO;
  if (height > cellHeightPx - margin * 2) {
    height = cellHeightPx - margin * 2;
    width = height * LOGO_RATIO;
  }
  sheet.addImage(logoImageId, { tl: { col: 1.1, row: 1.1 }, ext: { width, height } });

  const set = (cellRef: string, value: string) => {
    sheet.getCell(cellRef).value = value ?? "";
  };

  // 1. Datos generales del cliente y del SOP
  set("B6", data.datosGenerales.cliente);
  set("F6", data.datosGenerales.nit);
  set("I6", data.datosGenerales.sectorIndustria);
  set("L6", data.datosGenerales.tipoOperacion);
  set("B8", data.datosGenerales.tipoMercancia);
  set("F8", data.datosGenerales.serviciosContratados.join(", "));
  set("B10", data.datosGenerales.direccionPrincipal);
  set("J10", `${data.datosGenerales.ciudad}, ${data.datosGenerales.pais}`);
  set("M10", data.datosGenerales.fechaImplementacion);
  set("B12", OBJETIVO_SOP_DEFAULT);
  set("I12", ALCANCE_SOP_DEFAULT);

  // 2. Resumen ejecutivo del cliente
  set("B16", data.resumenEjecutivo.resumenNegocioCliente);
  set("I16", data.resumenEjecutivo.riesgosCriticosAlertas);
  set("B21", data.resumenEjecutivo.requiereAtencion247);
  set("E21", data.resumenEjecutivo.requiereReunionesKPI);
  set("H21", data.resumenEjecutivo.periodicidadRevisionSOP);
  set("L21", data.resumenEjecutivo.nivelCliente);

  // 3. Matriz de contactos
  (Object.keys(FILAS_CONTACTO) as (keyof typeof FILAS_CONTACTO)[]).forEach((tabla) => {
    const datosTabla = data.contactos[tabla];
    FILAS_CONTACTO[tabla].forEach((row, i) => {
      const dep = datosTabla.departamentos[i];
      if (!dep) return;
      set(`D${row}`, dep.nombreCargo);
      set(`F${row}`, dep.telefono);
      set(`G${row}`, dep.correo);
      set(`I${row}`, dep.backus);
      set(`K${row}`, datosTabla.escalonamiento.nombreCargo);
      set(`M${row}`, datosTabla.escalonamiento.telefono);
      set(`N${row}`, datosTabla.escalonamiento.correo);
    });
  });

  // 4. Preferencias, protocolos y particularidades
  set("B46", data.preferencias.trazabilidad.frecuenciaReportes);
  set("E46", data.preferencias.trazabilidad.formatoCanal);
  set("H46", data.preferencias.trazabilidad.contenidoMinimoRequerido);
  set("L46", data.preferencias.trazabilidad.instructivoOdooCliente);

  data.preferencias.comunicacion.forEach((bloque, i) => {
    const row = FILAS_COMUNICACION[i];
    if (!row) return;
    set(`E${row}`, bloque.canalesPreferidos);
    set(`H${row}`, bloque.frecuencia);
    set(`L${row}`, bloque.conCopiaContactosInternos);
  });

  // 5. Matriz de procesos y personalizaciones operativas
  data.matrizProcesos.forEach((proceso, i) => {
    const row = FILAS_PROCESO[i];
    if (!row) return;
    set(`D${row}`, proceso.aplica);
    set(`E${row}`, proceso.actividadHito);
    set(`H${row}`, proceso.personalizacionAcordada);
    set(`K${row}`, proceso.responsable);
    set(`L${row}`, proceso.slaTiempo);
    set(`M${row}`, proceso.kpiAsociado);
    set(`N${row}`, proceso.controlEvidencia);
  });

  // 6. Interacción con otras áreas y condiciones comerciales
  data.interaccionAreas.forEach((area, i) => {
    const row = FILAS_INTERACCION[i];
    if (!row) return;
    set(`D${row}`, area.reglaCondicionAcordada);
    set(`J${row}`, area.impactoOperativo);
    set(`M${row}`, area.observaciones);
  });

  // 7. Cumplimiento normativo y requisitos especiales
  data.cumplimiento.forEach((req, i) => {
    const row = FILAS_CUMPLIMIENTO[i];
    if (!row) return;
    set(`F${row}`, req.aplica);
    set(`H${row}`, req.detalleEvidenciaControl);
    set(`N${row}`, req.responsable);
  });

  // 8. Riesgos operativos y alertas (la plantilla solo trae 5 filas fijas;
  // si hay más, se anexan como texto al final de la última fila).
  data.riesgos.slice(0, FILAS_RIESGO.length).forEach((riesgo, i) => {
    const row = FILAS_RIESGO[i];
    set(`B${row}`, riesgo.riesgoCambioIdentificado);
    set(`G${row}`, riesgo.impacto);
    set(`J${row}`, riesgo.accionCorrectiva);
    set(`M${row}`, riesgo.responsable);
  });
  if (data.riesgos.length > FILAS_RIESGO.length) {
    const extra = data.riesgos.slice(FILAS_RIESGO.length);
    const ultimaFila = FILAS_RIESGO[FILAS_RIESGO.length - 1];
    const celda = sheet.getCell(`B${ultimaFila}`);
    const lineas = extra.map((r) => `- ${r.riesgoCambioIdentificado} (Impacto: ${r.impacto})`);
    celda.value = `${celda.value}\n\n+ ${extra.length} riesgo(s) adicional(es):\n${lineas.join("\n")}`;
  }

  // 9. Observaciones, validación y aprobaciones
  set("B110", data.aprobaciones.observaciones);
  set("B117", `Nombre: ${data.aprobaciones.revisoCliente.nombre}\nCargo: ${data.aprobaciones.revisoCliente.cargo}`);
  set("I117", `Nombre: ${data.aprobaciones.aproboCliente.nombre}\nCargo: ${data.aprobaciones.aproboCliente.cargo}`);
  set("B119", `Nombre: ${data.aprobaciones.revisoTurinza.nombre}\nCargo: ${data.aprobaciones.revisoTurinza.cargo}`);
  set("F119", `Nombre: ${data.aprobaciones.revisoTurinza.nombre}\nCargo: ${data.aprobaciones.revisoTurinza.cargo}`);
  set("K119", `Nombre: ${data.aprobaciones.aproboTurinza.nombre}\nCargo: ${data.aprobaciones.aproboTurinza.cargo}`);

  const salida = await workbook.xlsx.writeBuffer();
  return Buffer.from(salida);
}

export function nombreArchivoSop(data: SopFormValues): string {
  const cliente = data.datosGenerales.cliente.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "cliente";
  const fecha = new Date().toISOString().slice(0, 10);
  return `SOP-${cliente.replace(/\s+/g, "-")}-${fecha}.xlsx`;
}
