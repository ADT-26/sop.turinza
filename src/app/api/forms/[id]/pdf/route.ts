import { NextRequest, NextResponse } from "next/server";
import { idValido, obtenerSopPorId } from "@/lib/sopStore";
import { generarPdfSop, nombreArchivoPdf } from "@/lib/pdfExport";

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

    const pdf = await generarPdfSop(sop.data);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoPdf(sop.data)}"`,
      },
    });
  } catch (error) {
    console.error("Error generando el PDF del SOP:", error);
    return NextResponse.json({ success: false, error: "Error al generar el PDF" }, { status: 500 });
  }
}
