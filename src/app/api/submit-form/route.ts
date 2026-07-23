import { NextRequest, NextResponse } from "next/server";
import { sopFormSchema } from "@/lib/schemas";
import { guardarSop } from "@/lib/sopStore";
import { generarPdfSop, nombreArchivoPdf } from "@/lib/pdfExport";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = sopFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let id: string;
  try {
    ({ id } = await guardarSop(parsed.data));
  } catch (error) {
    console.error("Error guardando el SOP:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar el formulario" },
      { status: 500 },
    );
  }

  // El PDF es "best effort": si falla, el SOP ya quedó guardado de todas
  // formas — el cliente simplemente no recibe la descarga automática, pero
  // el administrador igual puede generarla después desde el panel interno.
  let pdfBase64: string | null = null;
  let nombreArchivo: string | null = null;
  try {
    const pdf = await generarPdfSop(parsed.data);
    pdfBase64 = pdf.toString("base64");
    nombreArchivo = nombreArchivoPdf(parsed.data);
  } catch (error) {
    console.error("Error generando el PDF del SOP (el SOP ya quedó guardado):", error);
  }

  return NextResponse.json({ success: true, id, pdfBase64, nombreArchivo }, { status: 201 });
}
