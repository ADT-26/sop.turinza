import { NextRequest, NextResponse } from "next/server";
import {
  getClientes, actualizarClientes,
  getVendedores, actualizarVendedores,
  getGrupos, actualizarGrupos,
  getBurbujas, actualizarBurbujas,
  getClienteVendedor, actualizarClienteVendedor,
} from "@/lib/configStore";

const TABLAS = {
  clientes:          { get: getClientes,          put: actualizarClientes },
  vendedores:        { get: getVendedores,         put: actualizarVendedores },
  grupos:            { get: getGrupos,             put: actualizarGrupos },
  burbujas:          { get: getBurbujas,           put: actualizarBurbujas },
  "cliente-vendedor":{ get: getClienteVendedor,    put: actualizarClienteVendedor },
} as const;

type TablaKey = keyof typeof TABLAS;

function esTablaValida(t: string): t is TablaKey {
  return t in TABLAS;
}

export async function GET(req: NextRequest) {
  const tabla = req.nextUrl.searchParams.get("tabla") ?? "";
  if (!esTablaValida(tabla)) {
    return NextResponse.json({ success: false, error: "Tabla no válida" }, { status: 400 });
  }
  try {
    const data = await TABLAS[tabla].get();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const tabla = req.nextUrl.searchParams.get("tabla") ?? "";
  if (!esTablaValida(tabla)) {
    return NextResponse.json({ success: false, error: "Tabla no válida" }, { status: 400 });
  }
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (TABLAS[tabla].put as (d: any[]) => Promise<void>)(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
