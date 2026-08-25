import { NextRequest, NextResponse } from "next/server";
import { getClientes } from "@/lib/configStore";

const LARGO_MINIMO = 3;
const LIMITE_RESULTADOS = 5;

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  if (q.length < LARGO_MINIMO) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const clientes = await getClientes();
    const coinciden = clientes.filter((c) => c.razon_social.toLowerCase().includes(q));
    // Primero los que empiezan con la búsqueda, luego los demás
    const ordenados = [
      ...coinciden.filter((c) => c.razon_social.toLowerCase().startsWith(q)),
      ...coinciden.filter((c) => !c.razon_social.toLowerCase().startsWith(q)),
    ];
    const resultados = ordenados
      .slice(0, LIMITE_RESULTADOS)
      .map((c) => ({ id: c.id, razon_social: c.razon_social, nit: c.nit }));

    return NextResponse.json({ success: true, data: resultados });
  } catch (error) {
    console.error("[clientes/buscar] error:", error);
    return NextResponse.json({ success: false, error: "Error al buscar" }, { status: 500 });
  }
}
