import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  idValido,
  obtenerSopPorId,
  actualizarNivelCliente,
  actualizarFirmaTurinza,
  actualizarContactosInternos,
  actualizarSop,
  eliminarSop,
} from "@/lib/sopStore";
import { OPCIONES_NIVEL_CLIENTE } from "@/lib/options";
import { AREAS_CONTACTO, sopFormSchema } from "@/lib/schemas";

const firmaSchema = z.object({ nombre: z.string(), cargo: z.string() });

const contactoSchema = z.object({ nombreCargo: z.string(), telefono: z.string(), correo: z.string() });
const contactoDepartamentoSchema = contactoSchema.extend({ area: z.string(), backus: z.string() });
const tablaContactosSchema = z.object({
  departamentos: z.array(contactoDepartamentoSchema).length(AREAS_CONTACTO.length),
  escalonamiento: contactoSchema,
});

const patchSchema = z.object({
  nivelCliente: z.enum(["", ...OPCIONES_NIVEL_CLIENTE]).optional(),
  revisoTurinza: firmaSchema.optional(),
  aproboTurinza: firmaSchema.optional(),
  contactosInternos: tablaContactosSchema.optional(),
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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idValido(id)) {
    return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
  }

  try {
    const eliminado = await eliminarSop(id);
    if (!eliminado) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando el SOP:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar el formulario" },
      { status: 500 },
    );
  }
}

// Reemplazo completo del SOP: el administrador corrige desde el panel
// interno los datos que diligenció el cliente (no solo los 3 campos propios
// de Turinza, que van por PATCH).
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = sopFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const actualizado = await actualizarSop(id, parsed.data);
    if (!actualizado) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: actualizado });
  } catch (error) {
    console.error("Error editando el SOP:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar los cambios" },
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

  const { nivelCliente, revisoTurinza, aproboTurinza, contactosInternos } = parsed.data;
  if (nivelCliente === undefined && !revisoTurinza && !aproboTurinza && !contactosInternos) {
    return NextResponse.json({ success: false, error: "Nada para actualizar" }, { status: 400 });
  }

  try {
    let actualizado = null;
    if (nivelCliente !== undefined) {
      actualizado = await actualizarNivelCliente(id, nivelCliente);
    }
    if (revisoTurinza) {
      actualizado = await actualizarFirmaTurinza(id, "revisoTurinza", revisoTurinza);
    }
    if (aproboTurinza) {
      actualizado = await actualizarFirmaTurinza(id, "aproboTurinza", aproboTurinza);
    }
    if (contactosInternos) {
      actualizado = await actualizarContactosInternos(id, contactosInternos);
    }
    if (!actualizado) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: actualizado });
  } catch (error) {
    console.error("Error actualizando el SOP:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar el cambio" },
      { status: 500 },
    );
  }
}
