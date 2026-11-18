"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState, useTransition, type FormEvent } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ESPECIES,
  ESTADOS,
  ETIQUETA_ESTADO,
  ETIQUETA_GENERO,
  GENEROS,
  rutaLista,
} from "@/lib/filtros";
import type { Filtros as TipoFiltros } from "@/lib/tipos";
import estilos from "./Filtros.module.css";

export const ESPERA_MS = 400;

type Selectores = { status: string; species: string; gender: string };
type Cambios = Partial<Selectores & { name: string }>;

const desdeUrl = (f: TipoFiltros): Selectores => ({
  status: f.status ?? "",
  species: f.species ?? "",
  gender: f.gender ?? "",
});

/**
 * Formulario de filtros. Sin JavaScript es un <form method="get" action="/">
 * normal (mejora progresiva). Con JavaScript: nombre con debounce de 400 ms,
 * desplegables inmediatos, router.replace y vuelta a page=1.
 */
export function Filtros({ inicial }: { inicial: TipoFiltros }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();

  const nombreUrl = inicial.name ?? "";
  const selectoresUrl = desdeUrl(inicial);
  const claveUrl = `${nombreUrl}|${selectoresUrl.status}|${selectoresUrl.species}|${selectoresUrl.gender}`;

  const [nombre, setNombre] = useState(nombreUrl);
  const [selectores, setSelectores] = useState(selectoresUrl);
  const nombreRetrasado = useDebounce(nombre, ESPERA_MS);
  const ultimoEnviado = useRef(nombreUrl);

  // Si la URL cambia desde fuera (Limpiar, atrás/adelante), los controles se sincronizan.
  const [claveUrlPrevia, setClaveUrlPrevia] = useState(claveUrl);
  if (claveUrl !== claveUrlPrevia) {
    setClaveUrlPrevia(claveUrl);
    setSelectores(selectoresUrl);
    if (nombreUrl !== nombreRetrasado.trim()) setNombre(nombreUrl);
  }

  function navegar(cambios: Cambios) {
    const actuales = Object.fromEntries(new URLSearchParams(window.location.search));
    const destino = rutaLista({ ...actuales, ...cambios, page: 1 });
    iniciarTransicion(() => router.replace(destino, { scroll: false }));
  }

  const alAsentarseNombre = useEffectEvent((valor: string) => {
    if (valor === ultimoEnviado.current) return;
    ultimoEnviado.current = valor;
    const actual = new URLSearchParams(window.location.search).get("name") ?? "";
    if (valor !== actual) navegar({ name: valor });
  });

  useEffect(() => {
    alAsentarseNombre(nombreRetrasado.trim());
  }, [nombreRetrasado]);

  function cambiarSelector(campo: keyof Selectores, valor: string) {
    setSelectores((s) => ({ ...s, [campo]: valor }));
    navegar({ [campo]: valor });
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    ultimoEnviado.current = nombre.trim();
    navegar({ name: ultimoEnviado.current, ...selectores });
  }

  const especies: string[] = [...ESPECIES];
  if (selectores.species && !especies.includes(selectores.species))
    especies.unshift(selectores.species);

  return (
    <div role="search" className={estilos.contenedor} aria-busy={pendiente}>
      <form
        aria-label="Filtrar personajes"
        action="/"
        method="get"
        onSubmit={enviar}
        className={estilos.form}
      >
        <div className={`${estilos.campo} ${estilos.campoNombre}`}>
          <label htmlFor="filtro-nombre">Nombre</label>
          <input
            id="filtro-nombre"
            name="name"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ej.: Rick, Morty, Birdperson…"
            maxLength={80}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            aria-describedby="filtro-nombre-ayuda"
          />
          <span id="filtro-nombre-ayuda" className={estilos.ayuda}>
            Se aplica al dejar de escribir.
          </span>
        </div>

        <div className={estilos.campo}>
          <label htmlFor="filtro-estado">Estado</label>
          <select
            id="filtro-estado"
            name="status"
            value={selectores.status}
            onChange={(e) => cambiarSelector("status", e.target.value)}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
        </div>

        <div className={estilos.campo}>
          <label htmlFor="filtro-especie">Especie</label>
          <select
            id="filtro-especie"
            name="species"
            value={selectores.species}
            onChange={(e) => cambiarSelector("species", e.target.value)}
          >
            <option value="">Todas</option>
            {especies.map((e) => (
              <option key={e} value={e}>
                {e === "unknown" ? "Desconocida" : e}
              </option>
            ))}
          </select>
        </div>

        <div className={estilos.campo}>
          <label htmlFor="filtro-genero">Género</label>
          <select
            id="filtro-genero"
            name="gender"
            value={selectores.gender}
            onChange={(e) => cambiarSelector("gender", e.target.value)}
          >
            <option value="">Todos</option>
            {GENEROS.map((g) => (
              <option key={g} value={g}>
                {ETIQUETA_GENERO[g]}
              </option>
            ))}
          </select>
        </div>

        <div className={estilos.acciones}>
          <button type="submit" className="boton">
            Buscar
          </button>
          <Link href="/" className="boton boton-secundario" scroll={false}>
            Limpiar
          </Link>
        </div>
      </form>
      {pendiente && <div className={estilos.progreso} aria-hidden="true" />}
    </div>
  );
}
