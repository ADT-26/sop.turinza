import { escribirArchivo, leerArchivo } from "./githubStore";

const EQUIPO_PATH = "data/config/equipo-turinza.json";

export interface MiembroEquipo {
  nombre: string;
  correo: string;
  telefono: string;
}

const EQUIPO_DEFAULT: MiembroEquipo[] = [
  { nombre: "Andrea Camila Curiel Borrego",    correo: "camila.curiel@turinza.com",     telefono: "" },
  { nombre: "Andres Felipe Gómez Chaguala",    correo: "andres.gomez@turinza.com",      telefono: "3188110743" },
  { nombre: "Camilo Andres Corredor Mendoza",  correo: "camilo.corredor@turinza.com",   telefono: "3183101488" },
  { nombre: "Carlos Del Toro Benavides",       correo: "comercial@turinza.com",         telefono: "3133671357" },
  { nombre: "Carlos Rodriguez",                correo: "carlos.rodriguez@turinza.com",  telefono: "" },
  { nombre: "Cristian Camilo Martinez Londoño",correo: "C.martinez@turinza.com",        telefono: "3188834025" },
  { nombre: "Diana P Méndez García",           correo: "comercial5@turinza.com",        telefono: "3186805730" },
  { nombre: "Diego Segura",                    correo: "comercial2@turinza.com",        telefono: "3160598633" },
  { nombre: "Elkin Andres Salinas Silva",      correo: "Insidesale2@turinza.com",       telefono: "3184648172" },
  { nombre: "Iliana Melissa Garzon Buritica",  correo: "melissa.garzon@turinza.com",    telefono: "3168964763" },
  { nombre: "Ingrid Lorena Gallo Mendoza",     correo: "lorena.mendoza@turinza.com",    telefono: "3186174500" },
  { nombre: "Jhon Jairo Martinez Ibañez",      correo: "j.martinez@turinza.com",        telefono: "" },
  { nombre: "Juan Carlos Mendoza Patiño",      correo: "juan.mendoza@turinza.com",      telefono: "3182132700" },
  { nombre: "Pablo Enrique Cholo Buitrago",    correo: "pablo.cholo@turinza.com",       telefono: "3183115959" },
  { nombre: "Patricia Rincon",                 correo: "P.rincon@turinza.com",          telefono: "3057437492" },
  { nombre: "Sandra Juliette Hernandez Parga", correo: "sandra.hernandez@turinza.com",  telefono: "" },
  { nombre: "Sara Valentina Santamaria",       correo: "Sara.santamaria@turinza.com",   telefono: "3187157757" },
  { nombre: "VVG",                             correo: "",                              telefono: "" },
  { nombre: "Yenifer Alejandra Grisales Reyes",correo: "yenifer.grisales@turinza.com",  telefono: "" },
];

export async function actualizarEquipoTurinza(miembros: MiembroEquipo[]): Promise<void> {
  const archivo = await leerArchivo(EQUIPO_PATH);
  await escribirArchivo(
    EQUIPO_PATH,
    JSON.stringify(miembros, null, 2),
    "config: equipo Turinza actualizado",
    archivo?.sha,
  );
}

export async function obtenerEquipoTurinza(): Promise<MiembroEquipo[]> {
  try {
    const archivo = await leerArchivo(EQUIPO_PATH);
    if (archivo) {
      const data = JSON.parse(archivo.content);
      // Migrar formato antiguo (string[]) al nuevo (MiembroEquipo[])
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
        const migrado: MiembroEquipo[] = (data as string[]).map((n) => ({ nombre: n, correo: "", telefono: "" }));
        await escribirArchivo(EQUIPO_PATH, JSON.stringify(migrado, null, 2), "config: migración formato equipo", archivo.sha);
        return migrado;
      }
      return data as MiembroEquipo[];
    }
    await escribirArchivo(EQUIPO_PATH, JSON.stringify(EQUIPO_DEFAULT, null, 2), "config: equipo Turinza (seed inicial)");
  } catch {
    // Si GitHub falla devolver la lista embebida
  }
  return EQUIPO_DEFAULT;
}
