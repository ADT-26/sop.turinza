import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { actualizarEquipoTurinza, obtenerEquipoTurinza } from "@/lib/configStore";

const miembroSchema = z.object({
  nombre:   z.string().min(1),
  correo:   z.string().default(""),
  telefono: z.string().default(""),
});

export async function GET() {
  try {
    const miembros = await obtenerEquipoTurinza();
    return NextResponse.json({ success: true, data: miembros });
  } catch (error) {
    console.error("Error obteniendo equipo Turinza:", error);
    return NextResponse.json({ success: false, error: "Error al obtener el equipo" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 }); }

  const parsed = z.array(miembroSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Formato inválido" }, { status: 400 });
  }
  try {
    await actualizarEquipoTurinza(parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando equipo:", error);
    return NextResponse.json({ success: false, error: "Error al guardar la lista" }, { status: 500 });
  }
}
