import { NextRequest, NextResponse } from "next/server";
import { sopFormSchema } from "@/lib/schemas";
import { guardarSop } from "@/lib/sopStore";

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

  return NextResponse.json({ success: true, id }, { status: 201 });
}
