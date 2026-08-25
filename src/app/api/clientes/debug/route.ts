import { NextResponse } from "next/server";

export async function GET() {
  const satisfaccionUrl = process.env.SATISFACCION_BASE_URL;

  const resultado: Record<string, unknown> = {
    SATISFACCION_BASE_URL: satisfaccionUrl ? `${satisfaccionUrl} (configurada)` : "NO CONFIGURADA",
    CLIENTES_REPO_OWNER_SATISFACCION: process.env.CLIENTES_REPO_OWNER_SATISFACCION ? "configurada" : "no",
    CLIENTES_REPO_NAME_SATISFACCION: process.env.CLIENTES_REPO_NAME_SATISFACCION ? "configurada" : "no",
  };

  // Prueba el proxy a satisfacción
  if (satisfaccionUrl) {
    try {
      const res = await fetch(
        `${satisfaccionUrl.replace(/\/$/, "")}/api/clientes/buscar?q=sol`,
        { cache: "no-store" },
      );
      const text = await res.text();
      resultado.proxy_status = res.status;
      resultado.proxy_ok = res.ok;
      try {
        const json = JSON.parse(text);
        resultado.proxy_registros = Array.isArray(json.data) ? json.data.length : "—";
        resultado.proxy_muestra = Array.isArray(json.data) ? json.data.slice(0, 2) : json;
      } catch {
        resultado.proxy_respuesta_raw = text.slice(0, 200);
      }
    } catch (err) {
      resultado.proxy_error = String(err);
    }
  }

  return NextResponse.json(resultado);
}
