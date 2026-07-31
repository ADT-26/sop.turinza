import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, DetailsSection } from "@/components/ui";
import { obtenerSopPorId } from "@/lib/sopStore";
import { OBJETIVO_SOP_DEFAULT } from "@/lib/formDefaults";
import { AccionesTurinza } from "@/components/dashboard/AccionesTurinza";
import { MatrizKpiEditor } from "@/components/dashboard/MatrizKpiEditor";
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
    <div className="min-h-screen bg-[#F5F7FA]">
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex flex-col gap-4 rounded-md bg-navy p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-white/50">SOP #{sop.id}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {data.datosGenerales.cliente}
          </h1>
          <p className="mt-1 font-mono text-sm text-white/55">
            {new Date(sop.createdAt).toLocaleString("es-CO")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Badge>{sop.estado}</Badge>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/${sop.id}/editar`}
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Editar datos del cliente
            </Link>
            <a
              href={`/api/forms/${sop.id}/excel`}
              className="rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
            >
              Descargar Excel
            </a>
            <a
              href={`/api/forms/${sop.id}/pdf`}
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Descargar PDF
            </a>
          </div>
          <EliminarSopButton id={sop.id} cliente={data.datosGenerales.cliente} redirectTo="/dashboard" />
        </div>
      </div>

      <AccionesTurinza id={sop.id} data={data} />

      <MatrizKpiEditor id={sop.id} valorInicial={sop.matrizKpi} />

      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-line" />
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
          <TablaResumen
            rows={data.contactos.cliente.departamentos}
            getTitulo={(r) => r.area}
            fields={[
              { key: "nombreCargo", label: "Nombre / Cargo" },
              { key: "telefono", label: "Teléfono" },
              { key: "correo", label: "Correo" },
              { key: "backus", label: "Backus" },
            ]}
          />
          <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4">
            <p className="mb-2 text-sm font-medium text-accent">Contacto de escalonamiento</p>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Campo label="Nombre / Cargo" value={data.contactos.cliente.escalonamiento.nombreCargo} />
              <Campo label="Teléfono" value={data.contactos.cliente.escalonamiento.telefono} />
              <Campo label="Correo" value={data.contactos.cliente.escalonamiento.correo} />
            </dl>
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
    </div>
  );
}
