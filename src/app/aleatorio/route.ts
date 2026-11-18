import { NextResponse, type NextRequest } from "next/server";
import { contarPersonajes } from "@/lib/api";

/** «Personaje al azar»: redirige a /personaje/{id} con un id aleatorio válido. */
export async function GET(peticion: NextRequest) {
  const total = await contarPersonajes().catch(() => 0);
  const id = total > 0 ? 1 + Math.floor(Math.random() * total) : 1;
  const respuesta = NextResponse.redirect(new URL(`/personaje/${id}`, peticion.url), 307);
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}
