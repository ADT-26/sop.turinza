import { NextRequest, NextResponse } from "next/server";
import { listarSops } from "@/lib/sopStore";
import {
  getClientes, getVendedores, getGrupos, getBurbujas, getClienteVendedor,
} from "@/lib/configStore";

function soloAdmin(req: NextRequest) {
  if (req.headers.get("x-dashboard-role") !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

function nivelMes(fecha: string): string {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(ym: string): string {
  const [y, m] = ym.split("-");
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${meses[Number(m) - 1]} ${y.slice(2)}`;
}

export async function GET(req: NextRequest) {
  const denegado = soloAdmin(req);
  if (denegado) return denegado;

  try {
    const [sops, clientes, vendedores, grupos, burbujas, relaciones] = await Promise.all([
      listarSops(500, 0),
      getClientes(),
      getVendedores(),
      getGrupos(),
      getBurbujas(),
      getClienteVendedor(),
    ]);

    // ── Conjunto de NITs con SOP ──────────────────────────────────────────
    const nitsConSop = new Set(sops.map((s) => s.nit.trim()));

    // ── Clientes del catálogo que tienen SOP (match por NIT) ─────────────
    const clientesConSop = clientes.filter((c) => nitsConSop.has(c.nit.trim()));
    const clientesSinSop = clientes.filter((c) => !nitsConSop.has(c.nit.trim()));

    const totalCatalogo = clientes.length;
    const tasaGlobal = totalCatalogo > 0
      ? Math.round((clientesConSop.length / totalCatalogo) * 100)
      : 0;

    // ── Participación por comercial ───────────────────────────────────────
    const porComercial = vendedores
      .map((v) => {
        const relacionesVendedor = relaciones.filter(
          (r) => r.vendedor_id === v.id && r.estado_operativo === "ACTIVO",
        );
        const clienteIds = [...new Set(relacionesVendedor.map((r) => r.cliente_id))];
        const total = clienteIds.length;
        const conSop = clienteIds.filter((cid) => {
          const cli = clientes.find((c) => c.id === cid);
          return cli ? nitsConSop.has(cli.nit.trim()) : false;
        }).length;
        return { nombre: v.nombre, total, conSop, tasa: total > 0 ? Math.round((conSop / total) * 100) : 0 };
      })
      .filter((v) => v.total > 0)
      .sort((a, b) => b.tasa - a.tasa);

    // ── Participación por burbuja ─────────────────────────────────────────
    const porBurbuja = burbujas
      .map((b) => {
        const relacionesBurbuja = relaciones.filter(
          (r) => r.burbuja_id === b.id && r.estado_operativo === "ACTIVO",
        );
        const clienteIds = [...new Set(relacionesBurbuja.map((r) => r.cliente_id))];
        const total = clienteIds.length;
        const conSop = clienteIds.filter((cid) => {
          const cli = clientes.find((c) => c.id === cid);
          return cli ? nitsConSop.has(cli.nit.trim()) : false;
        }).length;
        return { nombre: b.nombre, total, conSop, tasa: total > 0 ? Math.round((conSop / total) * 100) : 0 };
      })
      .filter((b) => b.total > 0)
      .sort((a, b) => b.tasa - a.tasa);

    // ── Participación por grupo ───────────────────────────────────────────
    const porGrupo = grupos
      .map((g) => {
        const relacionesGrupo = relaciones.filter(
          (r) => r.grupo_id === g.id && r.estado_operativo === "ACTIVO",
        );
        const clienteIds = [...new Set(relacionesGrupo.map((r) => r.cliente_id))];
        const total = clienteIds.length;
        const conSop = clienteIds.filter((cid) => {
          const cli = clientes.find((c) => c.id === cid);
          return cli ? nitsConSop.has(cli.nit.trim()) : false;
        }).length;
        return { nombre: g.nombre, total, conSop, tasa: total > 0 ? Math.round((conSop / total) * 100) : 0 };
      })
      .filter((g) => g.total > 0)
      .sort((a, b) => b.tasa - a.tasa);

    // ── Tendencia mensual (últimos 8 meses) ───────────────────────────────
    const ahora = new Date();
    const mesesClave: string[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      mesesClave.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const sopsPorMes: Record<string, number> = {};
    for (const m of mesesClave) sopsPorMes[m] = 0;
    for (const s of sops) {
      const m = nivelMes(s.createdAt);
      if (m in sopsPorMes) sopsPorMes[m]++;
    }
    const tendencia = mesesClave.map((m) => ({
      periodo: m,
      label: labelMes(m),
      cantidad: sopsPorMes[m],
    }));

    // ── Desglose por estado ───────────────────────────────────────────────
    const estadoMap: Record<string, number> = {};
    for (const s of sops) {
      estadoMap[s.estado] = (estadoMap[s.estado] ?? 0) + 1;
    }
    const porEstado = Object.entries(estadoMap)
      .map(([estado, cantidad]) => ({ estado, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // ── Clientes sin SOP (con comercial asignado) ─────────────────────────
    const sinSop = clientesSinSop.slice(0, 50).map((c) => {
      const rel = relaciones.find((r) => r.cliente_id === c.id && r.estado_operativo === "ACTIVO");
      const comercial = rel ? (vendedores.find((v) => v.id === rel.vendedor_id)?.nombre ?? "—") : "—";
      const burbujaNombre = rel?.burbuja_id
        ? (burbujas.find((b) => b.id === rel.burbuja_id)?.nombre ?? "—")
        : "—";
      return { razonSocial: c.razon_social, nit: c.nit, comercial, burbuja: burbujaNombre };
    });

    return NextResponse.json({
      success: true,
      data: {
        resumen: {
          totalSops: sops.length,
          clientesParticipantes: clientesConSop.length,
          clientesTotal: totalCatalogo,
          clientesSinSop: clientesSinSop.length,
          tasaGlobal,
        },
        porComercial,
        porBurbuja,
        porGrupo,
        tendencia,
        porEstado,
        sinSop,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
