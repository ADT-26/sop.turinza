import { NextRequest, NextResponse } from "next/server";
import { getClientes } from "@/lib/configStore";

const LARGO_MINIMO = 3;
const LIMITE_RESULTADOS = 10;

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  if (q.length < LARGO_MINIMO) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Proxy directo a la API de satisfacción (fuente única de verdad del catálogo)
  const satisfaccionUrl =
    process.env.SATISFACCION_BASE_URL ?? "https://encuesta-satisfaccion-turinza.vercel.app";
  {
    try {
      const res = await fetch(
        `${satisfaccionUrl.replace(/\/$/, "")}/api/clientes/buscar?q=${encodeURIComponent(q)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json);
      }
    } catch (err) {
      console.error("[clientes/buscar] proxy a satisfacción falló:", err);
    }
  }

  // Fallback: leer directo de GitHub
  try {
    const clientes = await getClientes();
    const resultados = clientes
      .filter((c) => c.razon_social.toLowerCase().includes(q))
      .slice(0, LIMITE_RESULTADOS)
      .map((c) => ({ id: c.id, razon_social: c.razon_social, nit: c.nit }));

    return NextResponse.json({ success: true, data: resultados });
  } catch (error) {
    console.error("[clientes/buscar] error:", error);
    return NextResponse.json({ success: false, error: "Error al buscar" }, { status: 500 });
  }
}
