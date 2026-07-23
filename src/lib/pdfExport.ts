// Generación server-side de PDF del SOP usando pdfmake (pure JS, compatible Vercel).
// Solo usar desde API routes o Server Actions, NUNCA en el cliente.
//
// pdfmake v0.3 no incluye tipos TypeScript; se usa require() para el módulo principal
// y se declaran tipos mínimos para los bloques que necesitamos.

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import type { SopFormValues } from "./schemas";

// Tipos mínimos de pdfmake para uso interno
type Content = string | ContentBlock | ContentBlock[] | Content[];
interface ContentBlock {
  text?: Content;
  table?: TableDef;
  columns?: ContentBlock[];
  stack?: ContentBlock[];
  ul?: Content[];
  style?: string | string[];
  bold?: boolean;
  italics?: boolean;
  fontSize?: number;
  color?: string;
  margin?: number[];
  alignment?: "left" | "center" | "right";
  width?: number | string;
  columnGap?: number;
  layout?: string | object;
  headlineLevel?: number;
  pageBreak?: "before" | "after";
  colSpan?: number;
  rowSpan?: number;
  fillColor?: string;
  border?: [boolean, boolean, boolean, boolean];
  noWrap?: boolean;
}
interface TableDef {
  headerRows?: number;
  widths?: (number | string)[];
  body: ContentBlock[][];
  dontBreakRows?: boolean;
}
interface DocDefinition {
  content: Content[];
  defaultStyle?: object;
  styles?: Record<string, object>;
  pageSize?: string;
  pageOrientation?: "landscape" | "portrait";
  pageMargins?: [number, number, number, number];
  header?: (page: number, pages: number) => ContentBlock;
  footer?: (page: number, pages: number) => ContentBlock;
  info?: Record<string, string>;
}

// Inicialización del singleton de pdfmake con la fuente Helvetica (estándar PDF)
function getPdfMake(): any {
  const pdfmake: any = require("pdfmake");
  if (!pdfmake._sopFontsLoaded) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const helvetica = require("pdfmake/build/standard-fonts/Helvetica");
    Object.entries(helvetica.vfs as Record<string, { data: string; binary?: boolean }>).forEach(
      ([k, v]) => {
        pdfmake.virtualfs.writeFileSync(k, v.data, v.binary ? "binary" : "utf8");
      },
    );
    pdfmake.addFonts({
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    });
    pdfmake.setLocalAccessPolicy(() => true);
    pdfmake.setUrlAccessPolicy(() => false);
    pdfmake._sopFontsLoaded = true;
  }
  return pdfmake;
}

// ─── Colores ────────────────────────────────────────────────────────────────
const C = {
  primary: "#0D3B5E",
  accent: "#C84B31",
  headerBg: "#0D3B5E",
  headerText: "#FFFFFF",
  subheaderBg: "#E8EFF6",
  subheaderText: "#0D3B5E",
  rowEven: "#F7FAFD",
  rowOdd: "#FFFFFF",
  border: "#C5D5E5",
  muted: "#6B7A8D",
  body: "#1A2535",
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────
const val = (v: string | undefined | null, fallback = "—") =>
  v && v.trim() ? v.trim() : fallback;

function sectionHeader(texto: string, pageBreak?: "before"): ContentBlock {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: texto.toUpperCase(),
            bold: true,
            fontSize: 9,
            color: C.headerText,
            fillColor: C.headerBg,
            margin: [6, 5, 6, 5],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, pageBreak ? 0 : 10, 0, 4],
    ...(pageBreak ? { pageBreak } : {}),
  };
}

function subHeader(texto: string): ContentBlock {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: texto,
            bold: true,
            fontSize: 8,
            color: C.subheaderText,
            fillColor: C.subheaderBg,
            margin: [6, 3, 6, 3],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 6, 0, 3],
  };
}

function campo(etiqueta: string, valor: string): ContentBlock {
  return {
    columns: [
      { text: etiqueta, bold: true, fontSize: 7.5, color: C.muted, width: 140 },
      { text: val(valor), fontSize: 7.5, color: C.body, width: "*" },
    ],
    columnGap: 6,
    margin: [0, 2, 0, 2],
  };
}

function tablaCabecera(cols: string[], widths: (string | number)[]): ContentBlock[] {
  return [
    {
      table: {
        headerRows: 1,
        widths,
        body: [
          cols.map((c) => ({
            text: c,
            bold: true,
            fontSize: 7,
            color: C.headerText,
            fillColor: C.headerBg,
            margin: [4, 3, 4, 3],
            border: [false, false, false, false],
          })),
        ],
      },
      layout: "noBorders",
      margin: [0, 0, 0, 0],
    },
  ];
}

function filaTabla(celdas: string[], par: boolean): ContentBlock[] {
  const bg = par ? C.rowEven : C.rowOdd;
  return [
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              columns: celdas.map((c, i) => ({
                text: val(c),
                fontSize: 7,
                color: C.body,
                fillColor: bg,
                width: i === 0 ? 120 : "*",
              })),
              columnGap: 4,
              fillColor: bg,
              margin: [4, 2, 4, 2],
              border: [false, false, false, true],
            },
          ],
        ],
        dontBreakRows: true,
      },
      layout: {
        hLineColor: () => C.border,
        vLineColor: () => C.border,
        hLineWidth: (_i: number, node: any) => (_i === node.table.body.length ? 0.5 : 0),
        vLineWidth: () => 0,
      },
      margin: [0, 0, 0, 0],
    },
  ];
}

function tablaGeneral(
  encabezados: string[],
  widths: (string | number)[],
  filas: string[][],
): ContentBlock {
  const body: ContentBlock[][] = [
    encabezados.map((h) => ({
      text: h,
      bold: true,
      fontSize: 7,
      color: C.headerText,
      fillColor: C.headerBg,
      margin: [4, 3, 4, 3],
    })),
    ...filas.map((fila, i) =>
      fila.map((celda) => ({
        text: val(celda),
        fontSize: 7,
        color: C.body,
        fillColor: i % 2 === 0 ? C.rowEven : C.rowOdd,
        margin: [4, 2, 4, 2],
      })),
    ),
  ];
  return {
    table: { headerRows: 1, widths, body, dontBreakRows: true },
    layout: {
      hLineColor: () => C.border,
      vLineColor: () => C.border,
      hLineWidth: (_i: number) => 0.5,
      vLineWidth: (_i: number) => 0.5,
      paddingTop: () => 2,
      paddingBottom: () => 2,
    },
    margin: [0, 2, 0, 8],
  };
}

// ─── Construcción del documento ─────────────────────────────────────────────
function construirDocumento(data: SopFormValues): DocDefinition {
  const { datosGenerales: dg, resumenEjecutivo: re, contactos, preferencias, matrizProcesos, interaccionAreas, cumplimiento, riesgos, aprobaciones } = data;

  const content: Content[] = [];

  // ── Encabezado principal ──────────────────────────────────────────────────
  content.push({
    table: {
      widths: ["*", 200],
      body: [
        [
          {
            stack: [
              { text: "STANDARD OPERATING PROCEDURE", bold: true, fontSize: 16, color: C.primary },
              { text: "SOP DE CLIENTE LOGÍSTICO  ·  OP-F001", fontSize: 8, color: C.muted, margin: [0, 2, 0, 0] },
            ],
            margin: [0, 4, 0, 4],
          },
          {
            stack: [
              { text: "Cliente:", bold: true, fontSize: 7.5, color: C.muted },
              { text: val(dg.cliente), fontSize: 10, bold: true, color: C.primary },
              { text: `NIT: ${val(dg.nit)}`, fontSize: 7.5, color: C.muted, margin: [0, 2, 0, 0] },
            ],
            alignment: "right" as const,
            margin: [0, 4, 0, 4],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 8],
  });

  // ── Sección 1: Datos Generales ────────────────────────────────────────────
  content.push(sectionHeader("1. Datos Generales del Cliente"));
  content.push({
    columns: [
      {
        width: "50%",
        stack: [
          campo("Sector / Industria", dg.sectorIndustria),
          campo("Tipo de operación", dg.tipoOperacion),
          campo("Tipo de mercancía", dg.tipoMercancia),
          campo("Dirección principal", dg.direccionPrincipal),
        ],
      },
      {
        width: "50%",
        stack: [
          campo("País", dg.pais),
          campo("Ciudad", dg.ciudad),
          campo("Fecha implementación", dg.fechaImplementacion),
          campo("Servicios contratados", dg.serviciosContratados.join(", ")),
        ],
      },
    ],
    columnGap: 20,
    margin: [0, 0, 0, 6],
  } as any);

  // ── Sección 2: Resumen Ejecutivo ──────────────────────────────────────────
  content.push(sectionHeader("2. Resumen Ejecutivo del Cliente"));
  content.push(campo("Resumen del negocio del cliente", re.resumenNegocioCliente));
  content.push(campo("Riesgos críticos / alertas operativas", re.riesgosCriticosAlertas));
  content.push({
    columns: [
      { width: "25%", stack: [campo("Requiere atención 24/7", re.requiereAtencion247)] },
      { width: "25%", stack: [campo("Requiere reuniones KPI", re.requiereReunionesKPI)] },
      { width: "25%", stack: [campo("Periodicidad revisión SOP", re.periodicidadRevisionSOP)] },
      { width: "25%", stack: [campo("Nivel cliente", re.nivelCliente)] },
    ],
    columnGap: 12,
    margin: [0, 4, 0, 6],
  } as any);

  // ── Sección 3: Contactos ──────────────────────────────────────────────────
  content.push(sectionHeader("3. Matriz de Contactos"));

  // Internos
  if (contactos.internos.departamentos.some((d) => d.nombreCargo || d.telefono || d.correo)) {
    content.push(subHeader("Contactos Internos Turinza"));
    content.push(
      tablaGeneral(
        ["Área", "Nombre / Cargo", "Teléfono", "Correo", "Back Up"],
        [100, "*", 80, "*", 80],
        contactos.internos.departamentos.map((d) => [
          d.area, d.nombreCargo, d.telefono, d.correo, d.backus,
        ]),
      ),
    );
    content.push(
      campo(
        "Escalonamiento",
        `${val(contactos.internos.escalonamiento.nombreCargo)} · ${val(contactos.internos.escalonamiento.telefono)} · ${val(contactos.internos.escalonamiento.correo)}`,
      ),
    );
  }

  // Cliente
  content.push(subHeader("Contactos del Cliente"));
  content.push(
    tablaGeneral(
      ["Área", "Nombre / Cargo", "Teléfono", "Correo", "Back Up"],
      [100, "*", 80, "*", 80],
      contactos.cliente.departamentos.map((d) => [
        d.area, d.nombreCargo, d.telefono, d.correo, d.backus,
      ]),
    ),
  );
  content.push(
    campo(
      "Escalonamiento",
      `${val(contactos.cliente.escalonamiento.nombreCargo)} · ${val(contactos.cliente.escalonamiento.telefono)} · ${val(contactos.cliente.escalonamiento.correo)}`,
    ),
  );

  // ── Sección 4: Preferencias ───────────────────────────────────────────────
  content.push(sectionHeader("4. Preferencias, Protocolos y Particularidades"));
  content.push(subHeader("4.1 Trazabilidad de operaciones & reportes"));
  content.push({
    columns: [
      { width: "25%", stack: [campo("Frecuencia de reportes", preferencias.trazabilidad.frecuenciaReportes)] },
      { width: "25%", stack: [campo("Formato / canal", preferencias.trazabilidad.formatoCanal)] },
      { width: "25%", stack: [campo("Contenido mínimo requerido", preferencias.trazabilidad.contenidoMinimoRequerido)] },
      { width: "25%", stack: [campo("Instructivo Odoo", preferencias.trazabilidad.instructivoOdooCliente)] },
    ],
    columnGap: 12,
    margin: [0, 0, 0, 6],
  } as any);

  content.push(subHeader("4.2 Comunicación, tiempos de respuesta y escalamiento"));
  content.push(
    tablaGeneral(
      ["Tipo", "Canales preferidos", "Frecuencia", "Con copia a internos"],
      [90, "*", 100, 120],
      preferencias.comunicacion.map((c) => [
        c.tipo ?? "—", c.canalesPreferidos, c.frecuencia, c.conCopiaContactosInternos,
      ]),
    ),
  );

  // ── Sección 5: Matriz de Procesos ─────────────────────────────────────────
  content.push(sectionHeader("5. Matriz de Procesos y Personalizaciones Operativas", "before"));

  const procesosActivos = matrizProcesos.filter((p) => p.aplica === "Sí");
  if (procesosActivos.length > 0) {
    content.push(
      tablaGeneral(
        ["Proceso", "Actividad / Hito", "Personalización acordada", "Responsable", "SLA", "KPI", "Control / Evidencia"],
        [80, "*", "*", 70, 50, 70, "*"],
        matrizProcesos.map((p) => [
          p.proceso ?? "—",
          p.aplica === "Sí" ? val(p.actividadHito) : `N/A`,
          p.aplica === "Sí" ? val(p.personalizacionAcordada) : "",
          p.aplica === "Sí" ? val(p.responsable) : "",
          p.aplica === "Sí" ? val(p.slaTiempo) : "",
          p.aplica === "Sí" ? val(p.kpiAsociado) : "",
          p.aplica === "Sí" ? val(p.controlEvidencia) : "",
        ]),
      ),
    );
  } else {
    content.push({ text: "No se acordaron personalizaciones en los procesos.", fontSize: 7.5, color: C.muted, margin: [0, 2, 0, 8] });
  }

  // ── Sección 6: Interacción con otras áreas ────────────────────────────────
  content.push(sectionHeader("6. Interacción con Otras Áreas y Condiciones Comerciales"));
  content.push(
    tablaGeneral(
      ["Área", "Regla / condición acordada", "Impacto operativo", "Observaciones"],
      [90, "*", "*", 100],
      interaccionAreas.map((a) => [
        a.area ?? "—", a.reglaCondicionAcordada, a.impactoOperativo, a.observaciones,
      ]),
    ),
  );

  // ── Sección 7: Cumplimiento normativo ─────────────────────────────────────
  content.push(sectionHeader("7. Cumplimiento Normativo y Requisitos Especiales"));
  content.push(
    tablaGeneral(
      ["Requisito", "¿Aplica?", "Detalle / evidencia / control", "Responsable"],
      [120, 45, "*", 90],
      cumplimiento.map((r) => [
        r.requisito ?? "—", r.aplica, r.aplica === "Sí" ? val(r.detalleEvidenciaControl) : "", r.aplica === "Sí" ? val(r.responsable) : "",
      ]),
    ),
  );

  // ── Sección 8: Riesgos ────────────────────────────────────────────────────
  content.push(sectionHeader("8. Riesgos Operativos y Alertas"));
  content.push({ text: "Nota: Los riesgos se revisan semestralmente y se actualizan cuando se identifican nuevos riesgos.", fontSize: 7, color: C.muted, italics: true, margin: [0, 0, 0, 4] });
  content.push(
    tablaGeneral(
      ["Riesgo / cambio identificado", "Impacto", "Acción correctiva", "Responsable"],
      ["*", 70, "*", 90],
      riesgos.map((r) => [
        r.riesgoCambioIdentificado, r.impacto, r.accionCorrectiva, r.responsable,
      ]),
    ),
  );

  // ── Sección 9: Aprobaciones ───────────────────────────────────────────────
  content.push(sectionHeader("9. Observaciones, Validación y Aprobaciones"));

  if (aprobaciones.observaciones.trim()) {
    content.push(campo("Observaciones generales", aprobaciones.observaciones));
  }

  content.push({ text: " ", margin: [0, 8, 0, 0] });

  // Tabla de firmas
  content.push({
    table: {
      widths: ["*", "*", "*", "*"],
      body: [
        [
          { text: "REVISÓ CLIENTE", bold: true, fontSize: 7, color: C.headerText, fillColor: C.headerBg, alignment: "center" as const, margin: [0, 4, 0, 4] },
          { text: "APROBÓ CLIENTE", bold: true, fontSize: 7, color: C.headerText, fillColor: C.headerBg, alignment: "center" as const, margin: [0, 4, 0, 4] },
          { text: "REVISÓ TURINZA", bold: true, fontSize: 7, color: C.headerText, fillColor: C.headerBg, alignment: "center" as const, margin: [0, 4, 0, 4] },
          { text: "APROBÓ TURINZA", bold: true, fontSize: 7, color: C.headerText, fillColor: C.headerBg, alignment: "center" as const, margin: [0, 4, 0, 4] },
        ],
        [
          { text: `${val(aprobaciones.revisoCliente.nombre)}\n${val(aprobaciones.revisoCliente.cargo)}`, fontSize: 7.5, alignment: "center" as const, margin: [4, 8, 4, 8] },
          { text: `${val(aprobaciones.aproboCliente.nombre)}\n${val(aprobaciones.aproboCliente.cargo)}`, fontSize: 7.5, alignment: "center" as const, margin: [4, 8, 4, 8] },
          { text: `${val(aprobaciones.revisoTurinza.nombre)}\n${val(aprobaciones.revisoTurinza.cargo)}`, fontSize: 7.5, alignment: "center" as const, margin: [4, 8, 4, 8] },
          { text: `${val(aprobaciones.aproboTurinza.nombre)}\n${val(aprobaciones.aproboTurinza.cargo)}`, fontSize: 7.5, alignment: "center" as const, margin: [4, 8, 4, 8] },
        ],
        [
          { text: "Firma:", fontSize: 7, color: C.muted, margin: [4, 24, 4, 4] },
          { text: "Firma:", fontSize: 7, color: C.muted, margin: [4, 24, 4, 4] },
          { text: "Firma:", fontSize: 7, color: C.muted, margin: [4, 24, 4, 4] },
          { text: "Firma:", fontSize: 7, color: C.muted, margin: [4, 24, 4, 4] },
        ],
      ],
      dontBreakRows: true,
    },
    layout: {
      hLineColor: () => C.border,
      vLineColor: () => C.border,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
    },
    margin: [0, 4, 0, 0],
  });

  return {
    content,
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 35, 30, 35],
    defaultStyle: { font: "Helvetica", fontSize: 8, color: C.body },
    styles: {},
    info: {
      title: `SOP - ${dg.cliente}`,
      author: "Turinza",
      subject: "Standard Operating Procedure",
    },
    header: (_page: number, pages: number) => ({
      columns: [
        { text: `SOP · ${val(dg.cliente)}`, fontSize: 7, color: C.muted, margin: [30, 12, 0, 0] },
        { text: `Página ${_page} de ${pages}`, fontSize: 7, color: C.muted, alignment: "right" as const, margin: [0, 12, 30, 0] },
      ],
    }),
    footer: () => ({
      text: "Documento confidencial — Turinza S.A.S. | Este SOP es de uso interno y del cliente. No se permite su distribución sin autorización.",
      fontSize: 6,
      color: C.muted,
      alignment: "center" as const,
      margin: [30, 8, 30, 0],
    }),
  };
}

export async function generarPdfSop(data: SopFormValues): Promise<Buffer> {
  const pdfmake = getPdfMake();
  const docDefinition = construirDocumento(data);
  const doc = pdfmake.createPdf(docDefinition);
  return doc.getBuffer();
}

export function nombreArchivoPdf(data: SopFormValues): string {
  const cliente = data.datosGenerales.cliente.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "cliente";
  const fecha = new Date().toISOString().slice(0, 10);
  return `SOP-${cliente.replace(/\s+/g, "-")}-${fecha}.pdf`;
}
