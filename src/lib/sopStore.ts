import { randomUUID } from "node:crypto";
import { GithubApiError, escribirArchivo, leerArchivo } from "./githubStore";
import type { SopFormValues } from "./schemas";

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
  return JSON.parse(archivo.content);
}
