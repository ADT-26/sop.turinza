import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { actualizarEquipoOperaciones, obtenerEquipoOperaciones } from "@/lib/configStore";

export async function GET() {
  try {
    const nombres = await obtenerEquipoOperaciones();
    return NextResponse.json({ success: true, data: nombres });
  } catch (error) {
    console.error("Error obteniendo equipo operaciones:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el equipo" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = z.array(z.string().min(1)).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Formato inválido" }, { status: 400 });
  }

  try {
    await actualizarEquipoOperaciones(parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando equipo:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar la lista" },
      { status: 500 },
    );
  }
}
