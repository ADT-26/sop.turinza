import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientes, actualizarClientes } from "@/lib/configStore";

const clienteSchema = z.object({
  id: z.number(),
  razon_social: z.string().min(1),
  nit: z.string(),
});

export async function GET() {
  try {
    const data = await getClientes();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const clientes = z.array(clienteSchema).parse(body);
    await actualizarClientes(clientes);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
