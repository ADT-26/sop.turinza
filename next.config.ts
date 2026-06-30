import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Asegura que la plantilla real del Excel quede empaquetada en las funciones
  // serverless que la usan (Vercel solo incluye lo que detecta automáticamente).
  outputFileTracingIncludes: {
    "/api/submit-form": ["./formats/formato_SOP.xlsx"],
    "/api/forms/[id]/excel": ["./formats/formato_SOP.xlsx"],
  },
};

export default nextConfig;
