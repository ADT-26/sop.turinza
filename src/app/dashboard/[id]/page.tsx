import { notFound } from "next/navigation";
import { Badge, SectionCard } from "@/components/ui";
import { obtenerSopPorId } from "@/lib/sopStore";

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
  const firmas = [
    { titulo: "Revisó Cliente", valor: data.aprobaciones.revisoCliente },
    { titulo: "Aprobó Cliente", valor: data.aprobaciones.aproboCliente },
    { titulo: "Revisó Turinza", valor: data.aprobaciones.revisoTurinza },
    { titulo: "Aprobó Turinza", valor: data.aprobaciones.aproboTurinza },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">SOP #{sop.id}</p>
          <h1 className="text-xl font-semibold text-ink">{data.datosGenerales.cliente}</h1>
          <p className="text-sm text-ink-muted">
            {new Date(sop.createdAt).toLocaleString("es-CO")}
          </p>
        </div>
        <Badge>{sop.estado}</Badge>
      </div>

      <SectionCard index={1} title="Datos generales del cliente y del SOP">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Campo label="Cliente / Razón social" value={data.datosGenerales.cliente} />
          <Campo label="NIT / ID" value={data.datosGenerales.nit} />
          <Campo label="Sector o Industria" value={data.datosGenerales.sectorIndustria} />
          <Campo label="Tipo de operación" value={data.datosGenerales.tipoOperacion} />
          <Campo label="Tipo de mercancía" value={data.datosGenerales.tipoMercancia} />
          <Campo label="País / Ciudad" value={data.datosGenerales.paisCiudad} />
          <Campo label="Dirección principal" value={data.datosGenerales.direccionPrincipal} />
          <Campo label="Fecha de implementación" value={data.datosGenerales.fechaImplementacion} />
          <Campo
            label="Servicios contratados"
            value={data.datosGenerales.serviciosContratados.join(", ")}
          />
        </dl>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Objetivo del SOP" value={data.datosGenerales.objetivoSOP} />
          <Campo label="Alcance del SOP" value={data.datosGenerales.alcanceSOP} />
        </div>
      </SectionCard>

      <SectionCard index={2} title="Resumen ejecutivo del cliente">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Campo label="Resumen del negocio del cliente" value={data.resumenEjecutivo.resumenNegocioCliente} />
          <Campo
            label="Riesgos críticos / alertas operativas"
            value={data.resumenEjecutivo.riesgosCriticosAlertas}
          />
          <Campo label="Requiere atención 24/7" value={data.resumenEjecutivo.requiereAtencion247} />
          <Campo label="Requiere reuniones KPI" value={data.resumenEjecutivo.requiereReunionesKPI} />
          <Campo
            label="Periodicidad revisión y actualización SOP"
            value={data.resumenEjecutivo.periodicidadRevisionSOP}
          />
          <Campo label="Nivel Cliente" value={data.resumenEjecutivo.nivelCliente} />
        </dl>
      </SectionCard>

      <SectionCard index={3} title="Matriz de contactos">
        <div className="space-y-6">
          {(
            [
              ["Contactos internos Turinza / Cuenta", data.contactos.internos],
              ["Contactos del cliente", data.contactos.cliente],
            ] as const
          ).map(([titulo, tabla]) => (
            <div key={titulo} className="space-y-3">
              <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
              <TablaResumen
                rows={tabla.departamentos}
                getTitulo={(r) => r.area}
                fields={[
                  { key: "nombreCargo", label: "Nombre / Cargo" },
                  { key: "telefono", label: "Teléfono" },
                  { key: "correo", label: "Correo" },
                ]}
              />
              <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4">
                <p className="mb-2 text-sm font-medium text-accent">Contacto de escalonamiento</p>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <Campo label="Nombre / Cargo" value={tabla.escalonamiento.nombreCargo} />
                  <Campo label="Teléfono" value={tabla.escalonamiento.telefono} />
                  <Campo label="Correo" value={tabla.escalonamiento.correo} />
                </dl>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard index={4} title="Preferencias, protocolos y particularidades">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink">4.1 Trazabilidad de operaciones</h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Frecuencia de reportes del consolidado"
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
      </SectionCard>

      <SectionCard index={5} title="Matriz de procesos y personalizaciones operativas">
        <TablaResumen
          rows={data.matrizProcesos}
          getTitulo={(r) => r.proceso}
          fields={[
            { key: "aplica", label: "Aplica" },
            { key: "responsable", label: "Responsable" },
            { key: "actividadHito", label: "Actividad / Hito" },
            { key: "personalizacionAcordada", label: "Personalización acordada" },
            { key: "slaTiempo", label: "SLA / Tiempo" },
            { key: "kpiAsociado", label: "KPI asociado" },
            { key: "controlEvidencia", label: "Control / Evidencia" },
          ]}
        />
      </SectionCard>

      <SectionCard index={6} title="Interacción con otras áreas y condiciones comerciales">
        <TablaResumen
          rows={data.interaccionAreas}
          getTitulo={(r) => r.area}
          fields={[
            { key: "reglaCondicionAcordada", label: "Regla / condición acordada" },
            { key: "impactoOperativo", label: "Impacto operativo" },
            { key: "observaciones", label: "Observaciones" },
          ]}
        />
      </SectionCard>

      <SectionCard index={7} title="Cumplimiento normativo y requisitos especiales">
        <TablaResumen
          rows={data.cumplimiento}
          getTitulo={(r) => r.requisito}
          fields={[
            { key: "aplica", label: "¿Aplica?" },
            { key: "responsable", label: "Responsable" },
            { key: "detalleEvidenciaControl", label: "Detalle / evidencia / control" },
          ]}
        />
      </SectionCard>

      <SectionCard index={8} title="Riesgos operativos y alertas">
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
      </SectionCard>

      <SectionCard index={9} title="Observaciones, validación y aprobaciones">
        <div className="space-y-4">
          <Campo label="Observaciones" value={data.aprobaciones.observaciones} />
          <div className="grid gap-4 sm:grid-cols-2">
            {firmas.map(({ titulo, valor }) => (
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
      </SectionCard>
    </div>
  );
}
