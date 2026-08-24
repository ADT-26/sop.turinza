import { escribirArchivo, leerArchivo } from "./githubStore";

const EQUIPO_PATH    = "data/config/equipo-turinza.json";
const DOCUMENTO_PATH = "data/config/documento.json";

// ── Configuración del documento ───────────────────────────────────────────────

export interface ConfigDocumento {
  codigoDocumento: string;  // "OP-F02"
  version: string;          // "01"
  vigencia: string;         // "junio de 2026"
  tipoDocumento: string;    // "Doc. controlado"
}

const DOCUMENTO_DEFAULT: ConfigDocumento = {
  codigoDocumento: "OP-F02",
  version: "01",
  vigencia: "junio de 2026",
  tipoDocumento: "Doc. controlado",
};

export async function obtenerConfigDocumento(): Promise<ConfigDocumento> {
  try {
    const archivo = await leerArchivo(DOCUMENTO_PATH);
    if (archivo) return { ...DOCUMENTO_DEFAULT, ...(JSON.parse(archivo.content) as Partial<ConfigDocumento>) };
    await escribirArchivo(DOCUMENTO_PATH, JSON.stringify(DOCUMENTO_DEFAULT, null, 2), "config: documento (seed inicial)");
  } catch { /* si GitHub falla usar el default */ }
  return DOCUMENTO_DEFAULT;
}

export async function actualizarConfigDocumento(cfg: ConfigDocumento): Promise<void> {
  const archivo = await leerArchivo(DOCUMENTO_PATH);
  await escribirArchivo(
    DOCUMENTO_PATH,
    JSON.stringify(cfg, null, 2),
    "config: metadatos del documento actualizados",
    archivo?.sha,
  );
}

export interface MiembroEquipo {
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
}

const EQUIPO_DEFAULT: MiembroEquipo[] = [
  { nombre: "Andrea Camila Curiel Borrego",    cargo: "", correo: "camila.curiel@turinza.com",     telefono: "" },
  { nombre: "Andres Felipe Gómez Chaguala",    cargo: "", correo: "andres.gomez@turinza.com",      telefono: "3188110743" },
  { nombre: "Camilo Andres Corredor Mendoza",  cargo: "", correo: "camilo.corredor@turinza.com",   telefono: "3183101488" },
  { nombre: "Carlos Del Toro Benavides",       cargo: "", correo: "comercial@turinza.com",         telefono: "3133671357" },
  { nombre: "Carlos Rodriguez",                cargo: "", correo: "carlos.rodriguez@turinza.com",  telefono: "" },
  { nombre: "Cristian Camilo Martinez Londoño",cargo: "", correo: "C.martinez@turinza.com",        telefono: "3188834025" },
  { nombre: "Diana P Méndez García",           cargo: "", correo: "comercial5@turinza.com",        telefono: "3186805730" },
  { nombre: "Diego Segura",                    cargo: "", correo: "comercial2@turinza.com",        telefono: "3160598633" },
  { nombre: "Elkin Andres Salinas Silva",      cargo: "", correo: "Insidesale2@turinza.com",       telefono: "3184648172" },
  { nombre: "Iliana Melissa Garzon Buritica",  cargo: "", correo: "melissa.garzon@turinza.com",    telefono: "3168964763" },
  { nombre: "Ingrid Lorena Gallo Mendoza",     cargo: "", correo: "lorena.mendoza@turinza.com",    telefono: "3186174500" },
  { nombre: "Jhon Jairo Martinez Ibañez",      cargo: "", correo: "j.martinez@turinza.com",        telefono: "" },
  { nombre: "Juan Carlos Mendoza Patiño",      cargo: "", correo: "juan.mendoza@turinza.com",      telefono: "3182132700" },
  { nombre: "Pablo Enrique Cholo Buitrago",    cargo: "", correo: "pablo.cholo@turinza.com",       telefono: "3183115959" },
  { nombre: "Patricia Rincon",                 cargo: "", correo: "P.rincon@turinza.com",          telefono: "3057437492" },
  { nombre: "Sandra Juliette Hernandez Parga", cargo: "", correo: "sandra.hernandez@turinza.com",  telefono: "" },
  { nombre: "Sara Valentina Santamaria",       cargo: "", correo: "Sara.santamaria@turinza.com",   telefono: "3187157757" },
  { nombre: "VVG",                             cargo: "", correo: "",                              telefono: "" },
  { nombre: "Yenifer Alejandra Grisales Reyes",cargo: "", correo: "yenifer.grisales@turinza.com",  telefono: "" },
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
        const migrado: MiembroEquipo[] = (data as string[]).map((n) => ({ nombre: n, cargo: "", correo: "", telefono: "" }));
        await escribirArchivo(EQUIPO_PATH, JSON.stringify(migrado, null, 2), "config: migración formato equipo", archivo.sha);
        return migrado;
      }
      // Migrar registros sin campo cargo
      const lista = data as MiembroEquipo[];
      return lista.map((m) => ({ ...m, cargo: m.cargo ?? "" }));
    }
    await escribirArchivo(EQUIPO_PATH, JSON.stringify(EQUIPO_DEFAULT, null, 2), "config: equipo Turinza (seed inicial)");
  } catch {
    // Si GitHub falla devolver la lista embebida
  }
  return EQUIPO_DEFAULT;
}
