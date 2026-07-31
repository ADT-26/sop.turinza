// Migra registros guardados con el esquema anterior de contactos internos al
// esquema actual:
//   - Pasada 1: si los departamentos eran 4 (sin Comercial/Pricing), los
//     prepende respetando el orden del template Excel (filas 32-37).
//   - Pasada 2: si algún departamento no tiene `escalonamiento` propio (schema
//     anterior usaba un único escalonamiento compartido a nivel de tabla), lo
//     inicializa vacío para que cada departamento lleve el suyo.
export function migrarContactosInternosLegacy(data: unknown): unknown {
  if (typeof data !== "object" || !data) return data;
  const d = data as Record<string, unknown>;
  if (typeof d.contactos !== "object" || !d.contactos) return data;
  const contactos = d.contactos as Record<string, unknown>;
  if (typeof contactos.internos !== "object" || !contactos.internos) return data;
  const internos = contactos.internos as Record<string, unknown>;
  if (!Array.isArray(internos.departamentos)) return data;

  let deps = internos.departamentos as Record<string, unknown>[];
  let changed = false;

  // Pasada 1: prepende Comercial + Pricing si aún no están
  if (deps.length < 6 && (deps.length === 0 || deps[0].area !== "Comercial")) {
    const vacio = { nombreCargo: "", telefono: "", correo: "", backus: "" };
    deps = [
      { area: "Comercial", ...vacio },
      { area: "Pricing / Inside Sale", ...vacio },
      ...deps,
    ];
    changed = true;
  }

  // Pasada 2: agrega escalonamiento por departamento si falta
  const depsMigradas = deps.map((dep) => {
    if (typeof dep.escalonamiento === "object" && dep.escalonamiento !== null) return dep;
    changed = true;
    return { ...dep, escalonamiento: { nombreCargo: "", telefono: "", correo: "" } };
  });

  if (!changed) return data;

  return {
    ...d,
    contactos: {
      ...contactos,
      internos: {
        ...internos,
        departamentos: depsMigradas,
      },
    },
  };
}

// Rellena campos faltantes en `valor` con los valores de `defecto`, de forma
// recursiva. Se usa para normalizar tanto registros guardados en el servidor
// (obtenerSopPorId) como borradores del localStorage (SopForm) cuando el schema
// gana un campo nuevo y la copia guardada no lo trae todavía.
//
// Para arrays:
//   - longitud 1 en `defecto` → ese elemento único sirve como plantilla para
//     CADA elemento de `valor` (p. ej. `riesgos`, de tamaño variable).
//   - longitud > 1 → merge posicional elemento a elemento (arrays de tamaño
//     fijo como matrizProcesos, departamentos de contactos, etc.).
// Migra registros guardados con el esquema anterior de matrizProcesos (campos
// planos en el objeto raíz de cada proceso) al nuevo esquema con `filas[]`.
export function migrarProcesosLegacy(data: unknown): unknown {
  if (typeof data !== "object" || !data) return data;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.matrizProcesos)) return data;
  const matrizMigrada = (d.matrizProcesos as unknown[]).map((item) => {
    const p = item as Record<string, unknown>;
    if (Array.isArray(p.filas)) return item;
    const { actividadHito, personalizacionAcordada, responsable, slaTiempo, kpiAsociado, controlEvidencia, ...rest } = p;
    return {
      ...rest,
      filas: [{ actividadHito: actividadHito ?? "", personalizacionAcordada: personalizacionAcordada ?? "", responsable: responsable ?? "", slaTiempo: slaTiempo ?? "", kpiAsociado: kpiAsociado ?? "", controlEvidencia: controlEvidencia ?? "" }],
    };
  });
  return { ...d, matrizProcesos: matrizMigrada };
}

export function conDefectos<T>(valor: unknown, defecto: T): T {
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
