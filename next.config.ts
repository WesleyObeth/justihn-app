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
      // Las tres experiencias públicas viven como secciones de la landing
      // (decisión Wesley 2026-08-29); el detalle /tramites/[id] se mantiene.
      { source: "/tramites", destination: "/#tramites", permanent: false },
      { source: "/consultorio", destination: "/#consultorio", permanent: false },
      { source: "/directorio", destination: "/#directorio", permanent: false },
      { source: "/portal/:path*", destination: "/abogados/:path*", permanent: true },
      // El portal ciudadano vivió en /persona hasta el 2026-08-29. Pasó a
      // /personas para leer como pareja de /abogados (las dos vías del
      // producto), y su pantalla "abogados" pasó a /directorio: `/abogados`
      // era a la vez el portal de suscriptores y una pantalla del ciudadano.
      { source: "/persona/abogados", destination: "/personas/directorio", permanent: true },
      { source: "/personas/abogados", destination: "/personas/directorio", permanent: true },
      { source: "/persona", destination: "/personas", permanent: true },
      { source: "/persona/:path*", destination: "/personas/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
