import { NextRequest, NextResponse } from "next/server";
import { listarSops } from "@/lib/sopStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const sops = await listarSops(limit, offset);
    return NextResponse.json({ success: true, data: sops });
  } catch (error) {
    console.error("Error listando SOPs:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar el almacén de formularios" },
      { status: 500 },
    );
  }
}
