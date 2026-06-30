import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { idValido, obtenerSopPorId, actualizarNivelCliente } from "@/lib/sopStore";
import { OPCIONES_NIVEL_CLIENTE } from "@/lib/options";

const patchSchema = z.object({
  nivelCliente: z.enum(["", ...OPCIONES_NIVEL_CLIENTE]),
});

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idValido(id)) {
    return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const actualizado = await actualizarNivelCliente(id, parsed.data.nivelCliente);
    if (!actualizado) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: actualizado });
  } catch (error) {
    console.error("Error actualizando el Nivel Cliente:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar el cambio" },
      { status: 500 },
    );
  }
}
