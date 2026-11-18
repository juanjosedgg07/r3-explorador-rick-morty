import { ImageResponse } from "next/og";
import { DESCRIPCION_SITIO, NOMBRE_SITIO } from "@/lib/sitio";

export const alt = NOMBRE_SITIO;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen Open Graph de la portada: portal (arte propio) + título. */
export default function ImagenOg() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: 72,
        background: "radial-gradient(circle at 80% 20%, #1c3b14 0%, #070b14 60%)",
        color: "#eef6ea",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 360,
          height: 360,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #f4ffd9 0%, #c6f07f 25%, #97ce4c 50%, #2f7d12 80%, #0f3a06 100%)",
          boxShadow: "0 0 120px 30px rgba(151,206,76,0.55)",
          display: "flex",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 28, color: "#a6e35a", letterSpacing: 4 }}>
          EXPLORADOR DEL MULTIVERSO
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>
          Rick and Morty
        </div>
        <div style={{ fontSize: 28, color: "#a9b8c6", marginTop: 24, lineHeight: 1.35 }}>
          {DESCRIPCION_SITIO}
        </div>
      </div>
    </div>,
    size,
  );
}
