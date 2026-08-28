"use client";

import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Participacion {
  nombre: string;
  total: number;
  conSop: number;
  tasa: number;
}

interface Tendencia {
  periodo: string;
  label: string;
  cantidad: number;
}

interface SinSop {
  razonSocial: string;
  nit: string;
  comercial: string;
  burbuja: string;
}

interface Analytics {
  resumen: {
    totalSops: number;
    clientesParticipantes: number;
    clientesTotal: number;
    clientesSinSop: number;
    tasaGlobal: number;
  };
  porComercial: Participacion[];
  porBurbuja: Participacion[];
  porGrupo: Participacion[];
  tendencia: Tendencia[];
  porEstado: { estado: string; cantidad: number }[];
  sinSop: SinSop[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tasaColor(tasa: number): string {
  if (tasa === 0) return "#C8102E";
  if (tasa < 50) return "#D97706";
  if (tasa < 80) return "#2563EB";
  return "#16A34A";
}

function tasaBg(tasa: number): string {
  if (tasa === 0) return "#FEE2E2";
  if (tasa < 50) return "#FEF3C7";
  if (tasa < 80) return "#DBEAFE";
  return "#DCFCE7";
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-white px-5 py-4 shadow-sm ${accent ? "border-accent/30" : "border-line"}`}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
      <p
        className={`mt-1 font-mono text-3xl font-bold tabular-nums leading-none ${accent ? "text-accent" : "text-navy"}`}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

// ── Trend SVG chart ───────────────────────────────────────────────────────────

function TrendChart({ data }: { data: Tendencia[] }) {
  if (data.length < 2) return null;

  const W = 480;
  const H = 90;
  const PX = 24;
  const PY = 12;
  const innerW = W - PX * 2;
  const innerH = H - PY * 2;
  const maxVal = Math.max(...data.map((d) => d.cantidad), 1);

  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * innerW,
    y: PY + innerH - (d.cantidad / maxVal) * innerH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = [
    `M${pts[0].x.toFixed(1)},${(PY + innerH).toFixed(1)}`,
    ...pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L${pts[pts.length - 1].x.toFixed(1)},${(PY + innerH).toFixed(1)}`,
    "Z",
  ].join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="border-b border-line px-5 py-3.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Tendencia de recepciones</p>
        <p className="mt-0.5 text-sm font-bold text-navy">SOPs recibidos por mes</p>
      </div>
      <div className="px-5 py-4">
        <svg
          viewBox={`0 0 ${W} ${H + 18}`}
          className="w-full"
          style={{ height: 120 }}
          aria-label="Gráfico de tendencia mensual"
        >
          {/* Grid lines */}
          {[0, 0.5, 1].map((frac) => {
            const y = PY + innerH - frac * innerH;
            return (
              <line key={frac} x1={PX} y1={y} x2={W - PX} y2={y}
                stroke="#DDE3EE" strokeWidth="1" strokeDasharray={frac === 0 ? "none" : "3 3"} />
            );
          })}
          {/* Area fill */}
          <path d={areaPath} fill="#1B2A4A" fillOpacity="0.08" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#1B2A4A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* Dots + values */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#1B2A4A" />
              {p.cantidad > 0 && (
                <text
                  x={p.x} y={p.y - 8} textAnchor="middle"
                  fontSize="10" fontFamily="monospace" fill="#1B2A4A" fontWeight="600"
                >
                  {p.cantidad}
                </text>
              )}
              <text
                x={p.x} y={H + 16} textAnchor="middle"
                fontSize="9" fontFamily="monospace" fill="#6B7A99"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Participation list (like the screenshot) ──────────────────────────────────

function ParticipacionLista({
  titulo,
  items,
  expanded,
}: {
  titulo: string;
  items: Participacion[];
  expanded?: boolean;
}) {
  const [open, setOpen] = useState(expanded ?? true);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <p className="text-sm font-bold text-navy">{titulo}</p>
        </div>
        <p className="px-5 py-6 text-sm text-ink-muted">Sin datos de participación</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Desglose</p>
          <p className="mt-0.5 text-sm font-bold text-navy">{titulo}</p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0 text-ink-muted transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 5l5 4 5-4" />
        </svg>
      </button>

      {open && (
        <div className="divide-y divide-line border-t border-line">
          {items.map((item) => {
            const pct = item.tasa;
            const sinSop = item.total - item.conSop;
            const color = tasaColor(pct);
            const bg = tasaBg(pct);
            return (
              <div key={item.nombre} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-semibold text-navy">{item.nombre}</span>
                  <span className="flex-shrink-0 font-mono text-sm tabular-nums text-ink-muted">
                    {item.conSop}/{item.total}
                    <span
                      className="ml-2 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold"
                      style={{ color, background: bg }}
                    >
                      {pct}%
                    </span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                {/* Detail */}
                <div className="mt-1.5 flex gap-3 text-[11px] text-ink-muted">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    {item.conSop} con SOP
                  </span>
                  {sinSop > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-line" />
                      {sinSop} pendiente{sinSop !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Estado pills ──────────────────────────────────────────────────────────────

const ESTADO_COLORS: Record<string, { text: string; bg: string }> = {
  Abierto:       { text: "#1B2A4A", bg: "#EEF1F6" },
  "En revisión": { text: "#D97706", bg: "#FEF3C7" },
  Aprobado:      { text: "#16A34A", bg: "#DCFCE7" },
  Obsoleto:      { text: "#6B7280", bg: "#F3F4F6" },
};

function PorEstado({ data }: { data: { estado: string; cantidad: number }[] }) {
  if (data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.cantidad, 0);
  return (
    <div className="rounded-xl border border-line bg-white shadow-sm">
      <div className="border-b border-line px-5 py-3.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Por estado</p>
        <p className="mt-0.5 text-sm font-bold text-navy">Desglose de SOPs</p>
      </div>
      <div className="flex flex-wrap gap-3 px-5 py-4">
        {data.map(({ estado, cantidad }) => {
          const col = ESTADO_COLORS[estado] ?? { text: "#1B2A4A", bg: "#EEF1F6" };
          const pct = total > 0 ? Math.round((cantidad / total) * 100) : 0;
          return (
            <div key={estado} className="flex flex-col items-center gap-1 rounded-lg px-4 py-3"
              style={{ background: col.bg }}>
              <span className="font-mono text-2xl font-bold tabular-nums leading-none"
                style={{ color: col.text }}>{cantidad}</span>
              <span className="text-xs font-semibold" style={{ color: col.text }}>{estado}</span>
              <span className="font-mono text-[10px] text-ink-muted">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sin SOP table ─────────────────────────────────────────────────────────────

function SinSopTabla({ data }: { data: SinSop[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-white px-5 py-4 shadow-sm">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Cobertura</p>
        <p className="mt-1 text-sm font-bold text-[#16A34A]">Todos los clientes del catálogo tienen SOP</p>
      </div>
    );
  }

  const filtrados = q.trim()
    ? data.filter(
        (d) =>
          d.razonSocial.toLowerCase().includes(q.toLowerCase()) ||
          d.comercial.toLowerCase().includes(q.toLowerCase()) ||
          d.nit.includes(q),
      )
    : data;

  return (
    <div className="rounded-xl border border-accent/25 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent/70">Pendientes</p>
          <p className="mt-0.5 text-sm font-bold text-navy">
            {data.length} cliente{data.length !== 1 ? "s" : ""} sin SOP
          </p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0 text-accent transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 5l5 4 5-4" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-line">
          <div className="px-5 py-3">
            <input
              type="search"
              placeholder="Buscar por cliente, NIT o comercial…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full max-w-sm rounded border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-navy/30"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Cliente</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">NIT</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Comercial</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Burbuja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-sm text-ink-muted">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  filtrados.map((d, i) => (
                    <tr key={i} className="hover:bg-surface/50">
                      <td className="px-4 py-2.5 font-medium text-ink">{d.razonSocial}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{d.nit}</td>
                      <td className="px-4 py-2.5 text-ink-muted">{d.comercial}</td>
                      <td className="px-4 py-2.5 text-ink-muted">{d.burbuja}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function IndicadoresPanel() {
  const [data, setData] = useState<Analytics | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics/sop")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.data);
        else setError(j.error ?? "Error al cargar indicadores");
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p className="text-sm text-ink-muted">Calculando indicadores…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-sm text-accent">
        {error ?? "Sin datos"}
      </p>
    );
  }

  const { resumen } = data;

  return (
    <div className="space-y-5">
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="SOPs recibidos"
          value={resumen.totalSops}
          sub="total de formularios"
        />
        <KpiCard
          label="Clientes participantes"
          value={resumen.clientesParticipantes}
          sub={`de ${resumen.clientesTotal} en el catálogo`}
        />
        <KpiCard
          label="Tasa global"
          value={`${resumen.tasaGlobal}%`}
          sub="clientes con SOP"
        />
        <KpiCard
          label="Sin SOP"
          value={resumen.clientesSinSop}
          sub="clientes pendientes"
          accent={resumen.clientesSinSop > 0}
        />
      </div>

      {/* ── Trend chart ── */}
      <TrendChart data={data.tendencia} />

      {/* ── Estado ── */}
      <PorEstado data={data.porEstado} />

      {/* ── Por comercial + burbuja ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ParticipacionLista titulo="Participación por comercial" items={data.porComercial} />
        <ParticipacionLista titulo="Participación por burbuja" items={data.porBurbuja} />
      </div>

      {/* ── Por grupo ── */}
      {data.porGrupo.length > 0 && (
        <ParticipacionLista titulo="Participación por grupo empresarial" items={data.porGrupo} expanded={false} />
      )}

      {/* ── Sin SOP ── */}
      <SinSopTabla data={data.sinSop} />
    </div>
  );
}
