import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de dev se ancla abajo a la izquierda, justo encima del avatar
  // del sidebar: tapa un control real y ensucia las capturas de revisión.
  devIndicators: false,

  // Cabeceras de seguridad base (§3 del blueprint) para toda respuesta.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Rutas históricas: el portal vivió en /portal hasta el 2026-08-25, cuando
  // pasó a /abogados (la raíz queda reservada para la vía B — gente común).
  async redirects() {
    return [
      { source: "/portal/inicio", destination: "/abogados/dashboard", permanent: true },
      { source: "/portal/paso-a-paso", destination: "/abogados/procesos", permanent: true },
      { source: "/abogados/paso-a-paso", destination: "/abogados/procesos", permanent: true },
      { source: "/portal/plantillas", destination: "/abogados/modelos", permanent: true },
      { source: "/abogados/plantillas", destination: "/abogados/modelos", permanent: true },
      { source: "/portal", destination: "/abogados", permanent: true },
      { source: "/portal/:path*", destination: "/abogados/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
