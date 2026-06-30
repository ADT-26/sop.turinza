import { randomUUID } from "node:crypto";
import { GithubApiError, eliminarArchivo, escribirArchivo, leerArchivo } from "./githubStore";
import { crearSopFormVacio } from "./formDefaults";
import type { SopFormValues, TablaContactos } from "./schemas";

const SOPS_DIR = "data/sops";
const INDEX_PATH = `${SOPS_DIR}/_index.json`;
const ID_PATTERN = /^\d+-[0-9a-f]{8}$/;

export interface SopResumen {
  id: string;
  cliente: string;
  nit: string;
  tipoOperacion: string;
  nivelCliente: string;
  estado: string;
  createdAt: string;
}

export interface SopRegistro {
  id: string;
  estado: string;
  createdAt: string;
  data: SopFormValues;
}

export function idValido(id: string): boolean {
  return ID_PATTERN.test(id);
}

// Registros guardados antes de que el schema ganara un campo nuevo (p. ej.
// "backus") no lo traen en su JSON. Se completa con la forma vigente
// (`crearSopFormVacio()`) en cada lectura para que el editor admin y el
// Excel siempre reciban un objeto válido contra el schema actual, sin migrar
// los archivos guardados. Para arreglos: los de 1 elemento (como `riesgos`,
// de tamaño variable) usan ese elemento como plantilla para cada fila real;
// el resto son de tamaño fijo (coinciden 1 a 1 con las filas de la sección).
function conDefectos<T>(valor: unknown, defecto: T): T {
  if (Array.isArray(defecto)) {
    if (!Array.isArray(valor)) return defecto;
    const plantilla = defecto.length === 1 ? defecto[0] : undefined;
    return valor.map((item, i) =>
      conDefectos(item, plantilla !== undefined ? plantilla : (defecto as unknown[])[i]),
    ) as T;
  }
  if (defecto !== null && typeof defecto === "object") {
    if (valor === null || typeof valor !== "object") return defecto;
    const resultado = { ...(defecto as Record<string, unknown>) };
    for (const key of Object.keys(defecto as Record<string, unknown>)) {
      resultado[key] = conDefectos(
        (valor as Record<string, unknown>)[key],
        (defecto as Record<string, unknown>)[key],
      );
    }
    return resultado as T;
  }
  return valor === undefined ? defecto : (valor as T);
}

async function agregarAlIndice(resumen: SopResumen, intento = 0): Promise<void> {
  const existente = await leerArchivo(INDEX_PATH);
  const lista: SopResumen[] = existente ? JSON.parse(existente.content) : [];
  lista.unshift(resumen);

  try {
    await escribirArchivo(
      INDEX_PATH,
      JSON.stringify(lista, null, 2),
      `Índice: + ${resumen.cliente} (${resumen.id})`,
      existente?.sha,
    );
  } catch (error) {
    const esConflicto = error instanceof GithubApiError && error.status === 409;
    if (esConflicto && intento < 3) {
      await agregarAlIndice(resumen, intento + 1);
      return;
    }
    throw error;
  }
}

export async function guardarSop(data: SopFormValues): Promise<{ id: string }> {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const registro: SopRegistro = { id, estado: "Abierto", createdAt, data };

  await escribirArchivo(
    `${SOPS_DIR}/${id}.json`,
    JSON.stringify(registro, null, 2),
    `SOP: ${data.datosGenerales.cliente} (${id})`,
  );

  await agregarAlIndice({
    id,
    cliente: data.datosGenerales.cliente,
    nit: data.datosGenerales.nit,
    tipoOperacion: data.datosGenerales.tipoOperacion,
    nivelCliente: data.resumenEjecutivo.nivelCliente,
    estado: "Abierto",
    createdAt,
  });

  return { id };
}

export async function listarSops(limit = 50, offset = 0): Promise<SopResumen[]> {
  const archivo = await leerArchivo(INDEX_PATH);
  const lista: SopResumen[] = archivo ? JSON.parse(archivo.content) : [];
  return lista.slice(offset, offset + limit);
}

export async function obtenerSopPorId(id: string): Promise<SopRegistro | null> {
  if (!idValido(id)) return null;
  const archivo = await leerArchivo(`${SOPS_DIR}/${id}.json`);
  if (!archivo) return null;
  const registro: SopRegistro = JSON.parse(archivo.content);
  return { ...registro, data: conDefectos(registro.data, crearSopFormVacio()) };
}

async function eliminarDelIndice(id: string, intento = 0): Promise<void> {
  const existente = await leerArchivo(INDEX_PATH);
  if (!existente) return;
  const lista: SopResumen[] = JSON.parse(existente.content);
  const lista2 = lista.filter((s) => s.id !== id);
  if (lista2.length === lista.length) return;

  try {
    await escribirArchivo(
      INDEX_PATH,
      JSON.stringify(lista2, null, 2),
      `Índice: - ${id}`,
      existente.sha,
    );
  } catch (error) {
    const esConflicto = error instanceof GithubApiError && error.status === 409;
    if (esConflicto && intento < 3) {
      await eliminarDelIndice(id, intento + 1);
      return;
    }
    throw error;
  }
}

/** Elimina un SOP por completo: el archivo del registro y su entrada en el índice. */
export async function eliminarSop(id: string): Promise<boolean> {
  if (!idValido(id)) return false;
  const archivo = await leerArchivo(`${SOPS_DIR}/${id}.json`);
  if (!archivo) return false;

  await eliminarArchivo(`${SOPS_DIR}/${id}.json`, archivo.sha, `Eliminar SOP (${id})`);
  await eliminarDelIndice(id);

  return true;
}

async function actualizarIndiceTrasEdicion(id: string, data: SopFormValues, intento = 0): Promise<void> {
  const existente = await leerArchivo(INDEX_PATH);
  if (!existente) return;
  const lista: SopResumen[] = JSON.parse(existente.content);
  const idx = lista.findIndex((s) => s.id === id);
  if (idx === -1) return;
  lista[idx] = {
    ...lista[idx],
    cliente: data.datosGenerales.cliente,
    nit: data.datosGenerales.nit,
    tipoOperacion: data.datosGenerales.tipoOperacion,
    nivelCliente: data.resumenEjecutivo.nivelCliente,
  };

  try {
    await escribirArchivo(
      INDEX_PATH,
      JSON.stringify(lista, null, 2),
      `Índice: edición admin (${id})`,
      existente.sha,
    );
  } catch (error) {
    const esConflicto = error instanceof GithubApiError && error.status === 409;
    if (esConflicto && intento < 3) {
      await actualizarIndiceTrasEdicion(id, data, intento + 1);
      return;
    }
    throw error;
  }
}

// Permite al administrador corregir desde el panel interno los datos que el
// cliente diligenció (no solo los 3 campos exclusivos de Turinza). Reemplaza
// `data` por completo, ya validada contra `sopFormSchema` en la API route.
export async function actualizarSop(id: string, data: SopFormValues): Promise<SopRegistro | null> {
  if (!idValido(id)) return null;
  const archivo = await leerArchivo(`${SOPS_DIR}/${id}.json`);
  if (!archivo) return null;

  const anterior: SopRegistro = JSON.parse(archivo.content);
  const registro: SopRegistro = { ...anterior, data };

  await escribirArchivo(
    `${SOPS_DIR}/${id}.json`,
    JSON.stringify(registro, null, 2),
    `SOP editado por administrador (${id})`,
    archivo.sha,
  );

  await actualizarIndiceTrasEdicion(id, data);

  return registro;
}

async function actualizarIndiceNivelCliente(
  id: string,
  nivelCliente: string,
  intento = 0,
): Promise<void> {
  const existente = await leerArchivo(INDEX_PATH);
  if (!existente) return;
  const lista: SopResumen[] = JSON.parse(existente.content);
  const idx = lista.findIndex((s) => s.id === id);
  if (idx === -1) return;
  lista[idx] = { ...lista[idx], nivelCliente };

  try {
    await escribirArchivo(
      INDEX_PATH,
      JSON.stringify(lista, null, 2),
      `Índice: Nivel Cliente -> ${nivelCliente || "(vacío)"} (${id})`,
      existente.sha,
    );
  } catch (error) {
    const esConflicto = error instanceof GithubApiError && error.status === 409;
    if (esConflicto && intento < 3) {
      await actualizarIndiceNivelCliente(id, nivelCliente, intento + 1);
      return;
    }
    throw error;
  }
}

// El cliente no asigna su propio Nivel Cliente — lo hace el administrador
// desde el panel interno una vez revisa el SOP recibido.
export async function actualizarNivelCliente(
  id: string,
  nivelCliente: string,
): Promise<SopRegistro | null> {
  if (!idValido(id)) return null;
  const archivo = await leerArchivo(`${SOPS_DIR}/${id}.json`);
  if (!archivo) return null;

  const registro: SopRegistro = JSON.parse(archivo.content);
  registro.data = {
    ...registro.data,
    resumenEjecutivo: { ...registro.data.resumenEjecutivo, nivelCliente },
  };

  await escribirArchivo(
    `${SOPS_DIR}/${id}.json`,
    JSON.stringify(registro, null, 2),
    `Nivel Cliente -> ${nivelCliente || "(vacío)"} (${id})`,
    archivo.sha,
  );

  await actualizarIndiceNivelCliente(id, nivelCliente);

  return registro;
}

// Revisó/Aprobó Turinza tampoco las diligencia el cliente — el administrador
// las completa desde el panel interno. No requieren tocar el índice porque
// no aparecen en el listado de SOPs.
export async function actualizarFirmaTurinza(
  id: string,
  campo: "revisoTurinza" | "aproboTurinza",
  firma: { nombre: string; cargo: string },
): Promise<SopRegistro | null> {
  if (!idValido(id)) return null;
  const archivo = await leerArchivo(`${SOPS_DIR}/${id}.json`);
  if (!archivo) return null;

  const registro: SopRegistro = JSON.parse(archivo.content);
  registro.data = {
    ...registro.data,
    aprobaciones: { ...registro.data.aprobaciones, [campo]: firma },
  };

  await escribirArchivo(
    `${SOPS_DIR}/${id}.json`,
    JSON.stringify(registro, null, 2),
    `${campo} -> ${firma.nombre || "(vacío)"} (${id})`,
    archivo.sha,
  );

  return registro;
}

// Los Contactos internos Turinza / Cuenta tampoco los diligencia el cliente —
// el administrador los completa desde el panel interno. No tocan el índice
// porque no aparecen en el listado de SOPs.
export async function actualizarContactosInternos(
  id: string,
  internos: TablaContactos,
): Promise<SopRegistro | null> {
  if (!idValido(id)) return null;
  const archivo = await leerArchivo(`${SOPS_DIR}/${id}.json`);
  if (!archivo) return null;

  const registro: SopRegistro = JSON.parse(archivo.content);
  registro.data = {
    ...registro.data,
    contactos: { ...registro.data.contactos, internos },
  };

  await escribirArchivo(
    `${SOPS_DIR}/${id}.json`,
    JSON.stringify(registro, null, 2),
    `Contactos internos actualizados (${id})`,
    archivo.sha,
  );

  return registro;
}
