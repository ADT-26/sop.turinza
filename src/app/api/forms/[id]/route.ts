import { NextRequest, NextResponse } from "next/server";
import { idValido, obtenerSopPorId } from "@/lib/sopStore";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idValido(id)) {
    return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
  }

  try {
    const sop = await obtenerSopPorId(id);
    if (!sop) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: sop });
  } catch (error) {
    console.error("Error obteniendo el SOP:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar el almacén de formularios" },
      { status: 500 },
    );
  }
}
