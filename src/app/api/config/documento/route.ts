import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerConfigDocumento, actualizarConfigDocumento } from "@/lib/configStore";

const schema = z.object({
  codigoDocumento: z.string().min(1),
  version: z.string().min(1),
  vigencia: z.string().min(1),
  tipoDocumento: z.string().min(1),
});

export async function GET() {
  try {
    const data = await obtenerConfigDocumento();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    await actualizarConfigDocumento(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
