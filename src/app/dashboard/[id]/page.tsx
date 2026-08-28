import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, DetailsSection } from "@/components/ui";
import { obtenerSopPorId } from "@/lib/sopStore";
import { OBJETIVO_SOP_DEFAULT } from "@/lib/formDefaults";
import { AccionesTurinza } from "@/components/dashboard/AccionesTurinza";
import { MatrizKpiEditor } from "@/components/dashboard/MatrizKpiEditor";
import { ControlCambiosEditor } from "@/components/dashboard/ControlCambiosEditor";
import { EliminarSopButton } from "@/components/dashboard/EliminarSopButton";

export const dynamic = "force-dynamic";

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function TablaResumen({
  rows,
  getTitulo,
  fields,
}: {
  rows: Record<string, string>[];
  getTitulo: (row: Record<string, string>) => string;
  fields: { key: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-2 text-sm font-semibold text-ink">{getTitulo(row)}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <Campo key={f.key} label={f.label} value={row[f.key]} />
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

export default async function DetalleSopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sop = await obtenerSopPorId(id);
  if (!sop) notFound();

  const { data } = sop;
  const firmasCliente = [
    { titulo: "Revisó Cliente", valor: data.aprobaciones.revisoCliente },
    { titulo: "Aprobó Cliente", valor: data.aprobaciones.aproboCliente },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-6 py-8">

      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl bg-primary-dark shadow-md">
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors">
                ← Panel
              </Link>
              <span className="text-white/20">/</span>
              <span className="font-mono text-xs text-white/40">{sop.id}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
              {data.datosGenerales.cliente}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <Badge dark>{sop.estado}</Badge>
              <span className="font-mono text-xs text-white/40">
                {new Date(sop.createdAt).toLocaleString("es-CO")}
              </span>
              {data.datosGenerales.nit && (
                <span className="font-mono text-xs text-white/40">NIT {data.datosGenerales.nit}</span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/${sop.id}/editar`}
                className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                Editar datos
              </Link>
              <a
                href={`/api/forms/${sop.id}/excel`}
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                ↓ Excel
              </a>
              <a
                href={`/api/forms/${sop.id}/pdf`}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                ↓ PDF
              </a>
            </div>
            <div className="mt-1">
              <EliminarSopButton id={sop.id} cliente={data.datosGenerales.cliente} redirectTo="/dashboard" />
            </div>
          </div>
        </div>
        {/* Metadata bar */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 bg-white/[0.04] px-6 py-2.5">
          {[
            { label: "Sector", value: data.datosGenerales.sectorIndustria },
            { label: "Operación", value: data.datosGenerales.tipoOperacion },
            { label: "Nivel", value: data.resumenEjecutivo.nivelCliente || "—" },
          ].map(({ label, value }) => (
            <span key={label} className="font-mono text-[11px] text-white/50">
              {label}: <span className="text-white/75">{value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Zona Turinza ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-1">
        <div className="h-[3px] w-8 rounded-full bg-accent" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent/70">
          Gestión Turinza
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <AccionesTurinza id={sop.id} data={data} />

      <MatrizKpiEditor id={sop.id} valorInicial={sop.matrizKpi} />

      <ControlCambiosEditor id={sop.id} valorInicial={sop.controlCambios} />

      {/* ── Zona cliente ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-3">
        <div className="h-[3px] w-8 rounded-full bg-primary/30" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted/60">
          Datos enviados por el cliente
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-3">
        <DetailsSection index={1} title="Datos generales del cliente y del SOP" defaultOpen>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Campo label="Cliente / Razón social" value={data.datosGenerales.cliente} />
            <Campo label="NIT / ID" value={data.datosGenerales.nit} />
            <Campo label="Sector o Industria" value={data.datosGenerales.sectorIndustria} />
            <Campo label="Tipo de operación" value={data.datosGenerales.tipoOperacion} />
            <Campo label="Tipo de mercancía" value={data.datosGenerales.tipoMercancia} />
            <Campo label="País / Ciudad" value={`${data.datosGenerales.ciudad}, ${data.datosGenerales.pais}`} />
            <Campo label="Dirección principal" value={data.datosGenerales.direccionPrincipal} />
            <Campo label="Fecha de implementación" value={data.datosGenerales.fechaImplementacion} />
            <Campo
              label="Servicios contratados"
              value={data.datosGenerales.serviciosContratados.join(", ")}
            />
          </dl>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo label="Objetivo del SOP" value={OBJETIVO_SOP_DEFAULT} />
            <Campo label="Alcance del SOP" value={data.datosGenerales.alcanceSOP} />
          </div>
        </DetailsSection>

        <DetailsSection index={2} title="Resumen ejecutivo del cliente">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Campo label="Resumen del negocio del cliente" value={data.resumenEjecutivo.resumenNegocioCliente} />
            <Campo
              label="Riesgos críticos / alertas operativas"
              value={data.resumenEjecutivo.riesgosCriticosAlertas}
            />
            <Campo label="Requiere atención 24/7" value={data.resumenEjecutivo.requiereAtencion247} />
            <Campo label="Requiere reuniones KPI" value={data.resumenEjecutivo.requiereReunionesKPI} />
            <Campo label="Requiere reunión operativa semanal" value={data.resumenEjecutivo.requiereReunionOperativaSemanal} />
            <Campo label="Asistentes reunión operativa" value={data.resumenEjecutivo.asistentesReunionOperativa} />
            <Campo
              label="Periodicidad revisión y actualización SOP"
              value={data.resumenEjecutivo.periodicidadRevisionSOP}
            />
          </dl>
        </DetailsSection>

        <DetailsSection index={3} title="Matriz de contactos">
          <h3 className="text-sm font-semibold text-ink">Contactos del cliente</h3>
          <div className="space-y-3">
            {data.contactos.cliente.departamentos.map((dep, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface overflow-hidden">
                <p className="px-4 pt-3 pb-1 text-sm font-medium text-ink">{dep.area}</p>
                <dl className="grid gap-3 px-4 pb-3 sm:grid-cols-2">
                  <Campo label="Nombre / Cargo" value={dep.nombreCargo} />
                  <Campo label="Teléfono" value={dep.telefono} />
                  <Campo label="Correo" value={dep.correo} />
                  <Campo label="Backup" value={dep.backup} />
                </dl>
                <div className="border-t border-line/60 bg-white px-4 py-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted/60">Escalonamiento</p>
                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Campo label="Nombre / Cargo" value={dep.escalonamiento.nombreCargo} />
                    <Campo label="Teléfono" value={dep.escalonamiento.telefono} />
                    <Campo label="Correo" value={dep.escalonamiento.correo} />
                  </dl>
                </div>
              </div>
            ))}
          </div>
        </DetailsSection>

        <DetailsSection index={4} title="Preferencias, protocolos y particularidades">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-ink">4.1 Trazabilidad de operaciones</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Frecuencia del status consolidado de embarques"
                  value={data.preferencias.trazabilidad.frecuenciaReportes}
                />
                <Campo label="Formato / canal" value={data.preferencias.trazabilidad.formatoCanal} />
                <Campo
                  label="Contenido mínimo requerido"
                  value={data.preferencias.trazabilidad.contenidoMinimoRequerido}
                />
                <Campo
                  label="Instructivo Odoo para el cliente"
                  value={data.preferencias.trazabilidad.instructivoOdooCliente}
                />
              </dl>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-ink">4.2 Comunicación y escalamiento</h3>
              <TablaResumen
                rows={data.preferencias.comunicacion}
                getTitulo={(r) => r.tipo}
                fields={[
                  { key: "canalesPreferidos", label: "Canales preferidos" },
                  { key: "frecuencia", label: "Frecuencia" },
                  { key: "conCopiaContactosInternos", label: "Con copia a contactos internos" },
                ]}
              />
            </div>
          </div>
        </DetailsSection>

        <DetailsSection index={5} title="Matriz de procesos y personalizaciones operativas">
          <div className="space-y-3">
            {data.matrizProcesos.map((grupo, gi) => (
              <div key={gi} className="rounded-lg border border-line bg-surface p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink">{grupo.proceso}</p>
                  <span className="shrink-0 text-xs text-ink-muted">Aplica: {grupo.aplica || "—"}</span>
                </div>
                {grupo.filas.map((fila, fi) => (
                  <dl key={fi} className={`grid gap-3 sm:grid-cols-2${fi > 0 ? " mt-3 border-t border-line pt-3" : ""}`}>
                    <Campo label="Responsable" value={fila.responsable} />
                    <Campo label="SLA / Tiempo" value={fila.slaTiempo} />
                    <Campo label="Actividad / Hito" value={fila.actividadHito} />
                    <Campo label="Personalización acordada" value={fila.personalizacionAcordada} />
                    <Campo label="KPI asociado" value={fila.kpiAsociado} />
                    <Campo label="Control / Evidencia" value={fila.controlEvidencia} />
                  </dl>
                ))}
              </div>
            ))}
          </div>
        </DetailsSection>

        <DetailsSection index={6} title="Interacción con otras áreas y condiciones comerciales">
          <TablaResumen
            rows={data.interaccionAreas}
            getTitulo={(r) => r.area}
            fields={[
              { key: "reglaCondicionAcordada", label: "Regla / condición acordada" },
              { key: "impactoOperativo", label: "Impacto operativo" },
              { key: "observaciones", label: "Observaciones" },
            ]}
          />
        </DetailsSection>

        <DetailsSection index={7} title="Cumplimiento normativo y requisitos especiales">
          <TablaResumen
            rows={data.cumplimiento}
            getTitulo={(r) => r.requisito}
            fields={[
              { key: "aplica", label: "¿Aplica?" },
              { key: "responsable", label: "Responsable" },
              { key: "detalleEvidenciaControl", label: "Detalle / evidencia / control" },
            ]}
          />
        </DetailsSection>

        <DetailsSection index={8} title="Riesgos operativos y alertas">
          <TablaResumen
            rows={data.riesgos}
            getTitulo={(r) => r.riesgoCambioIdentificado || "Riesgo"}
            fields={[
              { key: "impacto", label: "Impacto" },
              { key: "responsable", label: "Responsable" },
              { key: "accionCorrectiva", label: "Acción correctiva" },
              { key: "eficacia", label: "Eficacia" },
            ]}
          />
        </DetailsSection>

        <DetailsSection index={9} title="Observaciones y aprobaciones del cliente">
          <div className="space-y-4">
            <Campo label="Observaciones" value={data.aprobaciones.observaciones} />
            <div className="grid gap-4 sm:grid-cols-2">
              {firmasCliente.map(({ titulo, valor }) => (
                <div key={titulo} className="rounded-lg border border-line bg-surface p-4">
                  <p className="mb-3 text-sm font-semibold text-ink">{titulo}</p>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <Campo label="Nombre" value={valor.nombre} />
                    <Campo label="Cargo" value={valor.cargo} />
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </DetailsSection>
      </div>
    </div>
  );
}
