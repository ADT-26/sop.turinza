import { NextRequest, NextResponse } from "next/server";

export type DashboardRole = "admin" | "viewer";

function noAutorizado() {
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Panel interno SOP"' },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const adminUser = process.env.DASHBOARD_USER;
  const adminPass = process.env.DASHBOARD_PASSWORD;
  const viewerUser = process.env.DASHBOARD_USER_VIEWER;
  const viewerPass = process.env.DASHBOARD_PASSWORD_VIEWER;

  if (!adminUser || !adminPass) {
    return new NextResponse(
      "Panel no configurado: faltan DASHBOARD_USER / DASHBOARD_PASSWORD",
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return noAutorizado();

  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  const colonIdx = decoded.indexOf(":");
  const user = colonIdx >= 0 ? decoded.slice(0, colonIdx) : decoded;
  const pass = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : "";

  let role: DashboardRole | null = null;
  if (user === adminUser && pass === adminPass) role = "admin";
  else if (viewerUser && viewerPass && user === viewerUser && pass === viewerPass) role = "viewer";

  if (!role) return noAutorizado();

  // Inyectar el rol como header de request — legible por server components y API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-dashboard-role", role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // /api/submit-form queda fuera a propósito: es el endpoint público del formulario.
  // /api/clientes/buscar también queda fuera: lo usa el autocomplete del formulario público.
  matcher: [
    "/dashboard/:path*",
    "/api/forms/:path*",
    "/api/config/:path*",
  ],
};
