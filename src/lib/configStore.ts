import { escribirArchivo, leerArchivo } from "./githubStore";

const EQUIPO_PATH = "data/config/equipo-operaciones.json";

const EQUIPO_DEFAULT: string[] = [
  "Camilo Andres Corredor Mendoza",
  "Ingrid Lorena Gallo Mendoza",
  "Jhon Jairo Martinez Ibañez",
  "Carlos Del Toro Benavides",
  "Yenifer Alejandra Grisales Reyes",
  "Juan Carlos Mendoza Patiño",
  "Elkin Andres Salinas Silva",
  "Iliana Melissa Garzon Buritica",
  "Cristian Camilo Martinez Londoño",
  "Patricia Rincon",
  "Diego Segura",
  "Pablo Enrique Cholo Buitrago",
  "Diana P Méndez García",
  "Carlos Rodriguez",
  "VVG",
];

export async function obtenerEquipoOperaciones(): Promise<string[]> {
  try {
    const archivo = await leerArchivo(EQUIPO_PATH);
    if (archivo) {
      return JSON.parse(archivo.content) as string[];
    }
    // Primera llamada: sembrar el archivo en la rama data
    await escribirArchivo(
      EQUIPO_PATH,
      JSON.stringify(EQUIPO_DEFAULT, null, 2),
      "config: equipo operaciones Turinza (seed inicial)",
    );
  } catch {
    // Si GitHub falla, devolver la lista embebida
  }
  return EQUIPO_DEFAULT;
}
