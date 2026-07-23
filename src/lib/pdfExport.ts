// Generación server-side del PDF del SOP usando pdfmake.
// Reproduce fielmente el layout de formato_SOP.xlsx: 14 columnas (B-O),
// mismos colores y estructura de celdas combinadas.
// Solo usar desde API routes o Server Actions.

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import path from "node:path";
import fs from "node:fs/promises";
import type { SopFormValues } from "./schemas";

const LOGO_PATH = path.join(process.cwd(), "public", "logo_turinza.png");

// ─── pdfmake singleton ────────────────────────────────────────────────────────
let _pm: any = null;
function getPdfMake(): any {
  if (_pm) return _pm;
  const pm: any = require("pdfmake");
  const hv = require("pdfmake/build/standard-fonts/Helvetica");
  Object.entries(hv.vfs).forEach(([k, v]: [string, any]) => {
    pm.virtualfs.writeFileSync(k, v.data, v.binary ? "binary" : "utf8");
  });
  pm.addFonts({
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  });
  pm.setLocalAccessPolicy(() => true);
  pm.setUrlAccessPolicy(() => false);
  _pm = pm;
  return pm;
}

// ─── Colores exactos del formato_SOP.xlsx ────────────────────────────────────
const C = {
  SEC_BG: "#1F4E78",  // cabeceras de sección (fila 4, 19, 28, …)
  SEC_FG: "#FFFFFF",
  SUB_BG: "#D9E2F3",  // sub-cabeceras (fila 29, 38, 49, …)
  SUB_FG: "#1F4E78",
  COL_BG: "#DCE6F1",  // rótulos de columna (fila 5, 31, 50, …)
  COL_FG: "#1F4E78",
  DAT_BG: "#FFFDF2",  // celdas de datos (fila 6, 8, …)
  DAT_FG: "#000000",
  NOT_BG: "#F8F9FA",  // filas de nota (p.ej. fila 105 riesgos)
  BRD: "#8CA8C5",
} as const;

// ─── 14 columnas = Excel B:O  ─────────────────────────────────────────────────
// Usamos '*' para que pdfmake calcule el ancho disponible exacto (página – márgenes – bordes)
// y lo divida en partes iguales, evitando cualquier recorte en el borde derecho.
const W14 = Array(14).fill("*") as string[];

// ─── Layout de bordes ─────────────────────────────────────────────────────────
const LAYOUT = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => C.BRD,
  vLineColor: () => C.BRD,
  paddingTop: () => 2,
  paddingBottom: () => 2,
  paddingLeft: () => 3,
  paddingRight: () => 3,
};

// ─── Helpers de celda ────────────────────────────────────────────────────────

// Placeholder para celdas ocupadas por colSpan / rowSpan
const PH: any = {};

// Tabla de 14 columnas uniformes
function tbl(body: any[][], mb = 0, pb?: "before"): any {
  const t: any = { table: { widths: W14, body }, layout: LAYOUT, margin: [0, 0, 0, mb] };
  if (pb) t.pageBreak = pb;
  return t;
}

// Fila de cabecera de sección (fondo navy, texto blanco)
function sh(texto: string): any[] {
  return [
    { text: texto.toUpperCase(), colSpan: 14, bold: true, fontSize: 8.5,
      fillColor: C.SEC_BG, color: C.SEC_FG, margin: [3, 3, 3, 3] },
    ...Array(13).fill(PH),
  ];
}

// Sub-cabecera (fondo azul claro)
function subh(texto: string, span = 14): any[] {
  return [
    { text: texto, colSpan: span, bold: true, fontSize: 8,
      fillColor: C.SUB_BG, color: C.SUB_FG, margin: [3, 2, 3, 2] },
    ...Array(span - 1).fill(PH),
  ];
}

// Rótulo de columna (azul muy claro)
function cl(texto: string, span = 1): any {
  const c: any = { text: texto, bold: true, fontSize: 7, fillColor: C.COL_BG, color: C.COL_FG,
    margin: [2, 2, 2, 2] };
  if (span > 1) c.colSpan = span;
  return c;
}

// Celda de dato (fondo crema)
function dc(val: unknown, span = 1, rs = 1): any {
  const text = (val === null || val === undefined || val === "") ? "—" : String(val);
  const c: any = { text, fontSize: 7.5, fillColor: C.DAT_BG, color: C.DAT_FG,
    margin: [2, 2, 2, 2] };
  if (span > 1) c.colSpan = span;
  if (rs > 1) c.rowSpan = rs;
  return c;
}

// Celda de nota (fondo gris claro, texto pequeño)
function nc(texto: string): any[] {
  return [
    { text: texto, colSpan: 14, fontSize: 7, fillColor: C.NOT_BG, color: "#444444",
      italics: true, margin: [3, 2, 3, 2] },
    ...Array(13).fill(PH),
  ];
}

// ─── SECCIÓN 1 ── Datos Generales ────────────────────────────────────────────
function buildSec1(dg: SopFormValues["datosGenerales"]): any {
  const servicios = Array.isArray(dg.serviciosContratados)
    ? dg.serviciosContratados.join(", ")
    : String(dg.serviciosContratados || "");

  return tbl([
    // Cabecera
    sh("1. Datos Generales del Cliente"),
    // Col labels fila 1: [B:E=4] [F:H=3] [I:K=3] [L:O=4]
    [cl("Cliente / Razón social", 4), PH, PH, PH,
     cl("NIT / ID", 3), PH, PH,
     cl("Sector o Industria", 3), PH, PH,
     cl("Tipo operación", 4), PH, PH, PH],
    // Datos fila 1
    [dc(dg.cliente, 4), PH, PH, PH,
     dc(dg.nit, 3), PH, PH,
     dc(dg.sectorIndustria, 3), PH, PH,
     dc(dg.tipoOperacion, 4), PH, PH, PH],
    // Col labels fila 2: [B:E=4] [F:O=10]
    [cl("Tipo de mercancía", 4), PH, PH, PH,
     cl("Servicios contratados", 10), PH, PH, PH, PH, PH, PH, PH, PH, PH],
    // Datos fila 2
    [dc(dg.tipoMercancia, 4), PH, PH, PH,
     dc(servicios, 10), PH, PH, PH, PH, PH, PH, PH, PH, PH],
    // Col labels fila 3: [B:I=8] [J:L=3] [M:O=3]
    [cl("Dirección principal", 8), PH, PH, PH, PH, PH, PH, PH,
     cl("País / Ciudad", 3), PH, PH,
     cl("Fecha de implementación del SOP", 3), PH, PH],
    // Datos fila 3
    [dc(dg.direccionPrincipal, 8), PH, PH, PH, PH, PH, PH, PH,
     dc(`${dg.ciudad}, ${dg.pais}`, 3), PH, PH,
     dc(dg.fechaImplementacion, 3), PH, PH],
    // Col labels fila 4: [B:H=7] [I:O=7]
    [cl("Objetivo del SOP", 7), PH, PH, PH, PH, PH, PH,
     cl("Alcance del SOP", 7), PH, PH, PH, PH, PH, PH],
    // Datos fila 4 (contenido largo → alto natural)
    [{ text: dg.objetivoSOP || "—", fontSize: 7, fillColor: C.DAT_BG, color: C.DAT_FG,
       colSpan: 7, margin: [2, 3, 2, 3] }, PH, PH, PH, PH, PH, PH,
     { text: dg.alcanceSOP || "—", fontSize: 7, fillColor: C.DAT_BG, color: C.DAT_FG,
       colSpan: 7, margin: [2, 3, 2, 3] }, PH, PH, PH, PH, PH, PH],
  ], 2);
}

// ─── SECCIÓN 2 ── Resumen Ejecutivo ──────────────────────────────────────────
function buildSec2(re: SopFormValues["resumenEjecutivo"]): any {
  // La sección resumen/riesgos tiene 4 filas de datos (tall)
  const ROWS = 4;
  const dataRows: any[][] = Array(ROWS).fill(null).map((_, i) =>
    i === 0
      ? [dc(re.resumenNegocioCliente, 7, ROWS), PH, PH, PH, PH, PH, PH,
         dc(re.riesgosCriticosAlertas, 7, ROWS), PH, PH, PH, PH, PH, PH]
      : Array(14).fill(PH)
  );

  return tbl([
    sh("2. Resumen Ejecutivo del Cliente"),
    // Col labels
    [cl("Resumen del negocio del cliente", 7), PH, PH, PH, PH, PH, PH,
     cl("Riesgos críticos / alertas operativas", 7), PH, PH, PH, PH, PH, PH],
    // Datos (4 filas combinadas = celda alta)
    ...dataRows,
    // Col labels flags: [B:D=3] [E:F=2] [G:H=2] [I:K=3] [L:M=2] [N:O=2]
    [cl("Requiere\natención 24/7", 3), PH, PH,
     cl("Requiere\nreuniones KPI", 2), PH,
     cl("Reunión operativa\nsemanal", 2), PH,
     cl("Asistentes\nreunión operativa", 3), PH, PH,
     cl("Periodicidad revisión\ny actualización SOP", 2), PH,
     cl("Nivel\nCliente", 2), PH],
    // Datos flags
    [dc(re.requiereAtencion247, 3), PH, PH,
     dc(re.requiereReunionesKPI, 2), PH,
     dc("—", 2), PH,
     dc("—", 3), PH, PH,
     dc(re.periodicidadRevisionSOP, 2), PH,
     dc(re.nivelCliente, 2), PH],
  ], 2);
}

// ─── SECCIÓN 3 ── Matriz de Contactos ────────────────────────────────────────
const AREAS_ESTATICAS_INTERNOS = [
  { area: "Comercial", nombreCargo: "", telefono: "", correo: "", backus: "" },
  { area: "Pricing / Inside Sale", nombreCargo: "", telefono: "", correo: "", backus: "" },
];

function filasContactos(deps: SopFormValues["contactos"]["internos"]["departamentos"],
                         esc: SopFormValues["contactos"]["internos"]["escalonamiento"],
                         prefix: { area: string; nombreCargo: string; telefono: string; correo: string; backus: string }[]): any[][] {
  const all = [...prefix, ...deps];
  const n = all.length;
  const escText = `${esc.nombreCargo || "—"}`;
  const escTel  = esc.telefono || "—";
  const escCor  = esc.correo   || "—";

  return all.map((dep, i) => {
    const base = [
      dc(dep.area, 2), PH,
      dc(dep.nombreCargo, 2), PH,
      dc(dep.telefono),
      dc(dep.correo, 2), PH,
      dc(dep.backus, 2), PH,
    ];
    if (i === 0) {
      // Primera fila: escalonamiento con rowSpan = n
      base.push(dc(escText, 2, n), PH, dc(escTel, 1, n), dc(escCor, 2, n), PH);
    } else {
      // Filas siguientes: placeholders para las celdas ya ocupadas
      base.push(PH, PH, PH, PH, PH);
    }
    return base;
  });
}

function buildSec3(c: SopFormValues["contactos"]): any {
  const colLabels = [
    cl("Área", 2), PH,
    cl("Nombre / Cargo", 2), PH,
    cl("Teléfono"),
    cl("Correo electrónico", 2), PH,
    cl("Back Up", 2), PH,
    cl("Nombre / Cargo", 2), PH,
    cl("Teléfono"),
    cl("Correo electrónico", 2), PH,
  ];

  return tbl([
    sh("3. Matriz de Contactos"),
    // Internos
    subh("CONTACTOS INTERNOS TURINZA / CUENTAS"),
    [...subh("Operativos", 9), ...subh("Escalonamiento", 5)],
    colLabels,
    ...filasContactos(c.internos.departamentos, c.internos.escalonamiento, AREAS_ESTATICAS_INTERNOS),
    // Cliente
    subh("CONTACTOS DEL CLIENTE"),
    [...subh("Operativos", 9), ...subh("Escalonamiento", 5)],
    colLabels,
    ...filasContactos(c.cliente.departamentos, c.cliente.escalonamiento, []),
  ], 2);
}

// ─── SECCIÓN 4 ── Preferencias, Protocolos y Comunicación ───────────────────
function buildSec4(pref: SopFormValues["preferencias"]): any {
  const t = pref.trazabilidad;
  // Col labels trazabilidad: [B:D=3] [E:G=3] [H:K=4] [L:O=4]
  const colT = [cl("Frecuencia del status consolidado", 3), PH, PH,
                cl("Formato / canal", 3), PH, PH,
                cl("Contenido mínimo requerido", 4), PH, PH, PH,
                cl("Instructivo Odoo para el cliente", 4), PH, PH, PH];
  const datT = [dc(t.frecuenciaReportes, 3), PH, PH,
                dc(t.formatoCanal, 3), PH, PH,
                dc(t.contenidoMinimoRequerido, 4), PH, PH, PH,
                dc(t.instructivoOdooCliente, 4), PH, PH, PH];

  const mkColC = () => [cl("Tipo de Comunicación", 3), PH, PH,
                cl("Canales preferidos", 3), PH, PH,
                cl("Frecuencia de la comunicación", 4), PH, PH, PH,
                cl("Con copia a contactos internos", 4), PH, PH, PH];

  const comRows: any[][] = [];
  pref.comunicacion.forEach((blq) => {
    comRows.push(mkColC());
    comRows.push([
      dc(blq.tipo, 3), PH, PH,
      dc(blq.canalesPreferidos, 3), PH, PH,
      dc(blq.frecuencia, 4), PH, PH, PH,
      dc(blq.conCopiaContactosInternos, 4), PH, PH, PH,
    ]);
  });

  return tbl([
    sh("4. Preferencias, Protocolos y Comunicación"),
    subh("4.1 Trazabilidad de operaciones e informes de gestión"),
    colT,
    datT,
    subh("4.2 Comunicación, tiempos de respuesta y canales preferidos"),
    ...comRows,
  ], 2);
}

// ─── SECCIÓN 5 ── Matriz de Procesos ─────────────────────────────────────────
function buildSec5(proc: SopFormValues["matrizProcesos"]): any {
  // Col labels: [B:C=2] [D=1] [E:G=3] [H:J=3] [K=1] [L=1] [M=1] [N:O=2]
  const colLabels = [
    cl("Proceso", 2), PH,
    cl("Aplica"),
    cl("Actividad / Hito", 3), PH, PH,
    cl("Personalización acordada", 3), PH, PH,
    cl("Responsable"),
    cl("SLA / Tiempo"),
    cl("KPI asociado"),
    cl("Control / Evidencia", 2), PH,
  ];

  const dataRows = proc.map((p) => [
    dc(p.proceso, 2), PH,
    dc(p.aplica),
    dc(p.actividadHito, 3), PH, PH,
    dc(p.personalizacionAcordada, 3), PH, PH,
    dc(p.responsable),
    dc(p.slaTiempo),
    dc(p.kpiAsociado),
    dc(p.controlEvidencia, 2), PH,
  ]);

  return tbl([
    sh("5. Matriz de Procesos y Personalización del Servicio"),
    colLabels,
    ...dataRows,
  ], 2, "before");
}

// ─── SECCIÓN 6 ── Interacción con Otras Áreas ────────────────────────────────
function buildSec6(inter: SopFormValues["interaccionAreas"]): any {
  // Col labels: [B:C=2] [D:I=6] [J:L=3] [M:O=3]
  const colLabels = [
    cl("Área", 2), PH,
    cl("Regla / condición acordada", 6), PH, PH, PH, PH, PH,
    cl("Impacto operativo", 3), PH, PH,
    cl("Observaciones", 3), PH, PH,
  ];

  const dataRows = inter.map((a) => [
    dc(a.area, 2), PH,
    dc(a.reglaCondicionAcordada, 6), PH, PH, PH, PH, PH,
    dc(a.impactoOperativo, 3), PH, PH,
    dc(a.observaciones, 3), PH, PH,
  ]);

  return tbl([
    sh("6. Interacción con Otras Áreas"),
    colLabels,
    ...dataRows,
  ], 2);
}

// ─── SECCIÓN 7 ── Cumplimiento Normativo ─────────────────────────────────────
function buildSec7(cum: SopFormValues["cumplimiento"]): any {
  // Col labels: [B:E=4] [F:G=2] [H:M=6] [N:O=2]
  const colLabels = [
    cl("Requisito", 4), PH, PH, PH,
    cl("¿Aplica?", 2), PH,
    cl("Detalle / evidencia / control", 6), PH, PH, PH, PH, PH,
    cl("Responsable", 2), PH,
  ];

  const dataRows = cum.map((r) => [
    dc(r.requisito, 4), PH, PH, PH,
    dc(r.aplica, 2), PH,
    dc(r.detalleEvidenciaControl, 6), PH, PH, PH, PH, PH,
    dc(r.responsable, 2), PH,
  ]);

  return tbl([
    sh("7. Cumplimiento Normativo y Requisitos Especiales"),
    colLabels,
    ...dataRows,
  ], 2);
}

// ─── SECCIÓN 8 ── Riesgos Operativos ─────────────────────────────────────────
function buildSec8(ries: SopFormValues["riesgos"]): any {
  // Col labels: [B:F=5] [G:I=3] [J:L=3] [M:N=2] [O=1]
  const colLabels = [
    cl("Riesgo / cambio identificado", 5), PH, PH, PH, PH,
    cl("Impacto", 3), PH, PH,
    cl("Acción correctiva", 3), PH, PH,
    cl("Responsable", 2), PH,
    cl("Eficacia"),
  ];

  const dataRows = ries.map((r) => [
    dc(r.riesgoCambioIdentificado, 5), PH, PH, PH, PH,
    dc(r.impacto, 3), PH, PH,
    dc(r.accionCorrectiva, 3), PH, PH,
    dc(r.responsable, 2), PH,
    dc(r.eficacia),
  ]);

  return tbl([
    sh("8. Riesgos Operativos y Alertas de Cambio"),
    nc("Nota: Los riesgos se revisan según la periodicidad acordada y se actualizan ante cambios en el negocio del cliente."),
    colLabels,
    ...dataRows,
  ], 2);
}

// ─── SECCIÓN 9 ── Observaciones, Validación y Firmas ─────────────────────────
function buildSec9(apr: SopFormValues["aprobaciones"]): any {
  // Zona de observaciones (1 fila alta)
  const ROWS_OBS = 3;
  const obsRows: any[][] = Array(ROWS_OBS).fill(null).map((_, i) =>
    i === 0
      ? [dc(apr.observaciones, 14, ROWS_OBS), ...Array(13).fill(PH)]
      : Array(14).fill(PH)
  );

  // Formato de texto de firma
  const firma = (f: { nombre?: string; cargo?: string }) =>
    `Nombre: ${f.nombre || "—"}\nCargo: ${f.cargo || "—"}`;

  return tbl([
    sh("9. Observaciones, Validación y Firmas"),
    // Sub-cabecera "OBSERVACIONES"
    subh("OBSERVACIONES"),
    ...obsRows,
    // Bloque de firmas cliente (fila 121-122 del Excel)
    [...subh("Revisó Cliente", 7), ...subh("Aprobó Cliente", 7)],
    [
      { text: firma(apr.revisoCliente), colSpan: 7, fontSize: 7.5,
        fillColor: C.DAT_BG, color: C.DAT_FG, margin: [2, 4, 2, 20] },
      PH, PH, PH, PH, PH, PH,
      { text: firma(apr.aproboCliente), colSpan: 7, fontSize: 7.5,
        fillColor: C.DAT_BG, color: C.DAT_FG, margin: [2, 4, 2, 20] },
      PH, PH, PH, PH, PH, PH,
    ],
    // Bloque de firmas Turinza (fila 123-124 del Excel)
    [...subh("Revisó Turinza", 7), ...subh("Aprobó Turinza", 7)],
    [
      { text: firma(apr.revisoTurinza), colSpan: 7, fontSize: 7.5,
        fillColor: C.DAT_BG, color: C.DAT_FG, margin: [2, 4, 2, 20] },
      PH, PH, PH, PH, PH, PH,
      { text: firma(apr.aproboTurinza), colSpan: 7, fontSize: 7.5,
        fillColor: C.DAT_BG, color: C.DAT_FG, margin: [2, 4, 2, 20] },
      PH, PH, PH, PH, PH, PH,
    ],
  ], 0, "before");
}

// ─── ENCABEZADO DEL DOCUMENTO ─────────────────────────────────────────────────
function buildEncabezado(cliente: string, fecha: string, logo?: string): any {
  const logoCell: any = logo
    ? { image: logo, fit: [90, 32], colSpan: 2, alignment: "left", margin: [2, 2, 2, 2],
        fillColor: "#FFFFFF" }
    : { text: "TURINZA", bold: true, fontSize: 10, color: C.SEC_BG, colSpan: 2,
        fillColor: "#FFFFFF", margin: [2, 4, 2, 4] };

  return tbl([
    // Fila 1: título completo (fila 1 del Excel)
    [{ text: "STANDARD OPERATING PROCEDURE (SOP) DE CLIENTE LOGÍSTICO",
       colSpan: 14, bold: true, fontSize: 12, color: C.SEC_BG, alignment: "center",
       fillColor: "#FFFFFF", margin: [3, 6, 3, 6] }, ...Array(13).fill(PH)],
    // Fila 2: logo | subtítulo | cliente/fecha | versión (fila 2 del Excel)
    [
      logoCell, PH,
      { text: "SOP DE CLIENTE LOGÍSTICO\nOP-F001", bold: true, fontSize: 8.5,
        color: C.SEC_BG, colSpan: 6, alignment: "center",
        fillColor: "#FFFFFF", margin: [2, 3, 2, 3] },
      PH, PH, PH, PH, PH,
      { text: `Cliente: ${cliente}\nFecha:   ${fecha}`, fontSize: 7.5,
        colSpan: 4, fillColor: "#FFFFFF", margin: [2, 3, 2, 3] },
      PH, PH, PH,
      { text: "Versión: 01\nVigencia: junio 2025", fontSize: 7,
        colSpan: 2, alignment: "right", fillColor: "#FFFFFF", margin: [2, 3, 2, 3] },
      PH,
    ],
  ], 4);
}

// ─── API PÚBLICA ──────────────────────────────────────────────────────────────

export async function generarPdfSop(data: SopFormValues): Promise<Buffer> {
  const pm = getPdfMake();

  let logo: string | undefined;
  try {
    const buf = await fs.readFile(LOGO_PATH);
    logo = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    // Logo no disponible; se usará texto de respaldo
  }

  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const docDef = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [20, 20, 20, 28] as [number, number, number, number],
    defaultStyle: { font: "Helvetica", fontSize: 7.5 },
    content: [
      buildEncabezado(data.datosGenerales.cliente, fechaHoy, logo),
      buildSec1(data.datosGenerales),
      buildSec2(data.resumenEjecutivo),
      buildSec3(data.contactos),
      buildSec4(data.preferencias),
      buildSec5(data.matrizProcesos),
      buildSec6(data.interaccionAreas),
      buildSec7(data.cumplimiento),
      buildSec8(data.riesgos),
      buildSec9(data.aprobaciones),
    ],
    footer: (page: number, pages: number) => ({
      text: `SOP · ${data.datosGenerales.cliente} · Página ${page} de ${pages} · Documento confidencial Turinza S.A.S.`,
      fontSize: 6,
      color: "#888888",
      alignment: "center",
      margin: [20, 8, 20, 0],
    }),
  };

  const doc = pm.createPdf(docDef);
  return doc.getBuffer();
}

export function nombreArchivoPdf(data: SopFormValues): string {
  const cliente = data.datosGenerales.cliente
    .replace(/[^a-zA-Z0-9 _\-áéíóúÁÉÍÓÚñÑ]/g, "")
    .trim() || "cliente";
  const fecha = new Date().toISOString().slice(0, 10);
  return `SOP-${cliente.replace(/\s+/g, "-")}-${fecha}.pdf`;
}
