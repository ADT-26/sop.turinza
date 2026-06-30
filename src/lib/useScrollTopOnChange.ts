import { useEffect } from "react";

// Al cambiar de paso del wizard (Siguiente / Anterior / clic en el indicador),
// sube la página al inicio — si no, el usuario se queda viendo el contenido a
// la altura de scroll donde estaba parado en el paso anterior.
export function useScrollTopOnChange(valor: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [valor]);
}
