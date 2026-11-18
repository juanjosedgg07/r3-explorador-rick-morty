import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLAVE_RECIENTES,
  MAX_RECIENTES,
  borrarRecientes,
  leerRecientes,
  leerRecientesServidor,
  parsearRecientes,
  registrarVisita,
  reiniciarRecientes,
  suscribirRecientes,
} from "@/lib/recientes";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

const { Recientes, RegistrarVisita } = await import("@/components/Recientes");

const avatar = (id: number) => `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`;
const p = (id: number) => ({ id, name: `Personaje ${id}`, image: avatar(id) });

beforeEach(() => {
  localStorage.clear();
  reiniciarRecientes();
});

describe("recientes (lógica)", () => {
  it("registra al principio, sin duplicados y con máximo", () => {
    for (let i = 1; i <= MAX_RECIENTES + 3; i++) registrarVisita(p(i));
    registrarVisita(p(5));
    const lista = leerRecientes();
    expect(lista).toHaveLength(MAX_RECIENTES);
    expect(lista[0].id).toBe(5);
    expect(lista.filter((r) => r.id === 5)).toHaveLength(1);
  });

  it("descarta datos inválidos o imágenes de otros dominios", () => {
    expect(parsearRecientes("basura")).toEqual([]);
    expect(parsearRecientes("{}")).toEqual([]);
    expect(
      parsearRecientes(
        JSON.stringify([p(1), { id: 2, name: "x", image: "https://malo.com/x.png" }, { id: -1 }]),
      ),
    ).toEqual([p(1)]);
  });

  it("borrar, servidor vacío y suscripción", () => {
    const cb = vi.fn();
    const cancelar = suscribirRecientes(cb);
    registrarVisita(p(1));
    window.dispatchEvent(new StorageEvent("storage", { key: CLAVE_RECIENTES }));
    expect(cb).toHaveBeenCalledTimes(2);
    borrarRecientes();
    expect(leerRecientes()).toEqual([]);
    expect(leerRecientesServidor()).toEqual([]);
    cancelar();
  });

  it("con localStorage bloqueado funciona en memoria", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    const rem = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(() => registrarVisita(p(3))).not.toThrow();
    expect(leerRecientes()[0].id).toBe(3);
    expect(() => borrarRecientes()).not.toThrow();
    get.mockRestore();
    set.mockRestore();
    rem.mockRestore();
  });
});

describe("Recientes (interfaz)", () => {
  it("no muestra nada sin historial y aparece al registrar una visita", () => {
    render(<Recientes />);
    expect(screen.queryByRole("heading", { name: "Vistos recientemente" })).toBeNull();
    act(() => {
      render(<RegistrarVisita personaje={p(7)} />);
    });
    expect(screen.getByRole("heading", { name: "Vistos recientemente" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Personaje 7" })).toHaveAttribute(
      "href",
      "/personaje/7",
    );
  });

  it("«Borrar historial» vacía la lista", async () => {
    registrarVisita(p(1));
    render(<Recientes />);
    await userEvent.click(screen.getByRole("button", { name: "Borrar historial" }));
    expect(screen.queryByRole("heading", { name: "Vistos recientemente" })).toBeNull();
  });
});
