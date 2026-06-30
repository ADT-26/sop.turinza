import { NextRequest, NextResponse } from "next/server";

function noAutorizado() {
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Panel interno SOP"' },
  });
}

export function proxy(request: NextRequest) {
  const usuario = process.env.DASHBOARD_USER;
  const clave = process.env.DASHBOARD_PASSWORD;

  if (!usuario || !clave) {
    return new NextResponse("Panel no configurado: faltan DASHBOARD_USER / DASHBOARD_PASSWORD", {
      status: 503,
    });
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return noAutorizado();
  }

  const [user, pass] = Buffer.from(auth.slice(6), "base64").toString("utf-8").split(":");
  if (user !== usuario || pass !== clave) {
    return noAutorizado();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
