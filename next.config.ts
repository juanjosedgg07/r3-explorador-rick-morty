import type { NextConfig } from "next";

// Cabeceras de seguridad (sección 10.4: HTTPS y cabeceras de seguridad).
const cabecerasSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // El taller usa el modelo de caché con fetch + next.revalidate (RF-08),
  // por eso no se activa cacheComponents.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rickandmortyapi.com", pathname: "/api/character/avatar/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
};

export default nextConfig;
