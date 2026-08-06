import { NextResponse } from "next/server";
import { obtenerEquipoOperaciones } from "@/lib/configStore";

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
