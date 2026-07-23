import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Asegura que la plantilla real del Excel quede empaquetada en las funciones
  // serverless que la usan (Vercel solo incluye lo que detecta automáticamente).
  outputFileTracingIncludes: {
    "/api/submit-form": ["./formats/formato_SOP.xlsx", "./public/logo_turinza.png"],
    "/api/forms/[id]/excel": ["./formats/formato_SOP.xlsx", "./public/logo_turinza.png"],
  },
  // pdfmake es server-only; excluirlo del bundle del cliente evita errores
  // de resolución de módulos Node.js en el navegador.
  serverExternalPackages: ["pdfmake"],
};

export default nextConfig;
