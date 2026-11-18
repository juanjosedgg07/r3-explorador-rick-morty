import type { Metadata, Viewport } from "next";
import { Bangers, Geist, Geist_Mono } from "next/font/google";
import { Cabecera } from "@/components/Cabecera";
import { EnfocarRuta } from "@/components/EnfocarRuta";
import { WebVitals } from "@/components/WebVitals";
import { DESCRIPCION_SITIO, NOMBRE_SITIO, urlSitio } from "@/lib/sitio";
import "./globals.css";

// Tipografía de títulos con aire de cómic (solo encabezados; el texto usa Geist).
const titulo = Bangers({
  variable: "--font-titulo",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: urlSitio(),
  title: { default: NOMBRE_SITIO, template: `%s · ${NOMBRE_SITIO}` },
  description: DESCRIPCION_SITIO,
  applicationName: NOMBRE_SITIO,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: NOMBRE_SITIO,
    title: NOMBRE_SITIO,
    description: DESCRIPCION_SITIO,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1214" },
  ],
  colorScheme: "light dark",
};

// Aplica el tema guardado ANTES de pintar (evita el destello) y marca que hay JS.
const scriptTema = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("r3:tema");if(t==="light"||t==="dark"||t==="contrast")d.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${titulo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        <Cabecera />
        <main id="contenido" tabIndex={-1} className="contenedor principal">
          {children}
        </main>
        <footer className="pie">
          <div className="contenedor">
            <p>
              Datos de{" "}
              <a href="https://rickandmortyapi.com" rel="noopener">
                The Rick and Morty API
              </a>
              . Taller de recuperación R3 · Next.js {new Date().getFullYear()}.
            </p>
          </div>
        </footer>
        <EnfocarRuta />
        <WebVitals />
      </body>
    </html>
  );
}
