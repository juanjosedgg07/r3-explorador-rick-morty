import type { Metadata } from "next";
import { ListaFavoritos } from "@/components/ListaFavoritos";

export const metadata: Metadata = {
  title: "Mis favoritos",
  description: "Sus personajes favoritos de Rick and Morty, guardados en este navegador.",
  alternates: { canonical: "/favoritos" },
  robots: { index: false, follow: true },
};

export default function Favoritos() {
  return (
    <>
      <h1>Mis favoritos</h1>
      <p>
        Se guardan en este navegador y se sincronizan entre pestañas: márquelos en una y aparecen
        aquí al instante.
      </p>
      <ListaFavoritos />
    </>
  );
}
