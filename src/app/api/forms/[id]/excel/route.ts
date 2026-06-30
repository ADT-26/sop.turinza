import { NextRequest, NextResponse } from "next/server";
import { idValido, obtenerSopPorId } from "@/lib/sopStore";
import { generarExcelSop, nombreArchivoSop } from "@/lib/excelExport";

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

    const excel = await generarExcelSop(sop.data);
    return new NextResponse(new Uint8Array(excel), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombreArchivoSop(sop.data)}"`,
      },
    });
  } catch (error) {
    console.error("Error generando el Excel del SOP:", error);
    return NextResponse.json({ success: false, error: "Error al generar el Excel" }, { status: 500 });
  }
}
