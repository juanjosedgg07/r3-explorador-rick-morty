import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tarjeta } from "@/components/Tarjeta";
import { Paginacion } from "@/components/Paginacion";
import { Estado } from "@/components/Estado";
import { reiniciarParaPruebas } from "@/lib/favoritos";
import type { Personaje } from "@/lib/tipos";

// next/navigation y next/image simulados para jsdom.
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("next/image", () => ({
  default: ({
    preload: _p,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { preload?: boolean }) => (
    <img {...props} alt={props.alt} />
  ),
}));

const { Filtros, ESPERA_MS } = await import("@/components/Filtros");

const rick: Personaje = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: { name: "Earth (C-137)", url: "" },
  location: { name: "Citadel of Ricks", url: "" },
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  episode: ["https://rickandmortyapi.com/api/episode/1"],
  url: "https://rickandmortyapi.com/api/character/1",
  created: "",
};

async function sinViolaciones(contenedor: Element) {
  const resultado = await axe.run(contenedor, {
    rules: { region: { enabled: false } }, // un componente suelto no tiene landmarks
  });
  const resumen = resultado.violations.map((v) => `${v.id}: ${v.help}`);
  expect(resumen).toEqual([]);
}

beforeEach(() => {
  localStorage.clear();
  reiniciarParaPruebas();
  replace.mockClear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Tarjeta", () => {
  it("muestra nombre, estado en texto y enlace al detalle", () => {
    render(<Tarjeta personaje={rick} />);
    const tarjeta = screen.getByRole("article");
    expect(within(tarjeta).getByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(within(tarjeta).getByText("Vivo")).toBeInTheDocument();
    expect(within(tarjeta).getByRole("link", { name: "Rick Sanchez" })).toHaveAttribute(
      "href",
      "/personaje/1",
    );
    expect(within(tarjeta).getByRole("img", { name: "Rick Sanchez" })).toBeInTheDocument();
  });

  it("el botón de favorito alterna aria-pressed y su etiqueta", async () => {
    const usuario = userEvent.setup();
    render(<Tarjeta personaje={rick} />);
    const boton = screen.getByRole("button", { name: "Agregar a Rick Sanchez a favoritos" });
    expect(boton).toHaveAttribute("aria-pressed", "false");
    await usuario.click(boton);
    expect(
      screen.getByRole("button", { name: "Quitar a Rick Sanchez de favoritos" }),
    ).toHaveAttribute("aria-pressed", "true");
    await usuario.click(screen.getByRole("button", { name: /Quitar a Rick/ }));
    expect(screen.getByRole("button", { name: /Agregar a Rick/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("no tiene violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <ul>
        <li>
          <Tarjeta personaje={rick} />
        </li>
      </ul>,
    );
    await sinViolaciones(container);
  });
});

describe("Estado", () => {
  it.each([
    ["Alive", "Vivo"],
    ["Dead", "Muerto"],
    ["unknown", "Desconocido"],
  ] as const)("%s se muestra como «%s»", (estado, texto) => {
    render(<Estado estado={estado} />);
    expect(screen.getByText(texto)).toBeInTheDocument();
  });
});

describe("Filtros", () => {
  it("el nombre NO actualiza la URL hasta pasados 400 ms (una sola actualización)", () => {
    vi.useFakeTimers();
    render(<Filtros inicial={{ page: 1 }} />);
    const campo = screen.getByRole("searchbox", { name: "Nombre" });
    for (const texto of ["m", "mo", "mor", "mort", "morty"]) {
      fireEvent.change(campo, { target: { value: texto } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    expect(replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(ESPERA_MS - 101);
    });
    expect(replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/?name=morty", { scroll: false });
  });

  it("un desplegable actualiza la URL al instante, conserva filtros y vuelve a page=1", async () => {
    window.history.replaceState(null, "", "/?name=rick&page=3");
    const usuario = userEvent.setup();
    render(<Filtros inicial={{ name: "rick", page: 3 }} />);
    await usuario.selectOptions(screen.getByRole("combobox", { name: "Estado" }), "alive");
    expect(replace).toHaveBeenCalledWith("/?name=rick&status=alive", { scroll: false });
  });

  it("muestra los valores de la URL en los controles", () => {
    render(
      <Filtros inicial={{ name: "rick", status: "dead", gender: "female", species: "Alien" }} />,
    );
    expect(screen.getByRole("searchbox", { name: "Nombre" })).toHaveValue("rick");
    expect(screen.getByRole("combobox", { name: "Estado" })).toHaveValue("dead");
    expect(screen.getByRole("combobox", { name: "Género" })).toHaveValue("female");
    expect(screen.getByRole("combobox", { name: "Especie" })).toHaveValue("Alien");
  });

  it("el contenedor tiene role=search, cada control su label, y sin violaciones de axe", async () => {
    const { container } = render(<Filtros inicial={{}} />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    await sinViolaciones(container);
  });
});

describe("Paginación", () => {
  it("deshabilita «Anterior» en la primera página y conserva los filtros", () => {
    render(
      <Paginacion filtros={{ name: "rick", status: "alive" }} pagina={1} paginas={3} total={60} />,
    );
    const nav = screen.getByRole("navigation", { name: "Paginación" });
    expect(within(nav).getByText(/Anterior/)).toHaveAttribute("aria-disabled", "true");
    expect(within(nav).getByRole("link", { name: /Siguiente/ })).toHaveAttribute(
      "href",
      "/?name=rick&status=alive&page=2",
    );
    expect(nav).toHaveTextContent("Página 1 de 3");
    expect(nav).toHaveTextContent("60 resultados");
  });

  it("deshabilita «Siguiente» en la última página y marca la actual", () => {
    render(<Paginacion filtros={{}} pagina={3} paginas={3} total={60} />);
    expect(screen.getByText(/Siguiente/)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "Página 3" })).toHaveAttribute("aria-current", "page");
  });

  it("no se muestra con una sola página", () => {
    const { container } = render(<Paginacion filtros={{}} pagina={1} paginas={1} total={4} />);
    expect(container).toBeEmptyDOMElement();
  });
});
