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
