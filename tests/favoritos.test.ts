import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLAVE,
  alternar,
  disponible,
  esFavorito,
  escribir,
  leer,
  leerServidor,
  limpiar,
  parsear,
  quitar,
  reiniciarParaPruebas,
  suscribir,
} from "@/lib/favoritos";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useDebounce } from "@/hooks/useDebounce";

beforeEach(() => {
  localStorage.clear();
  reiniciarParaPruebas();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("favoritos (localStorage)", () => {
  it("parsear valida y descarta basura", () => {
    expect(parsear(null)).toEqual([]);
    expect(parsear("no es json")).toEqual([]);
    expect(parsear('{"a":1}')).toEqual([]);
    expect(parsear('[1, 2, 2, -4, "x", 3.5, 7]')).toEqual([1, 2, 7]);
  });

  it("alternar agrega y quita, y persiste en localStorage", () => {
    expect(alternar(1)).toBe(true);
    expect(alternar(2)).toBe(true);
    expect(leer()).toEqual([1, 2]);
    expect(localStorage.getItem(CLAVE)).toBe("[1,2]");
    expect(alternar(1)).toBe(false);
    expect(leer()).toEqual([2]);
    expect(esFavorito(2)).toBe(true);
  });

  it("leer devuelve la misma referencia si el dato no cambió", () => {
    escribir([5]);
    expect(leer()).toBe(leer());
  });

  it("quitar y limpiar", () => {
    escribir([1, 2, 3]);
    quitar(2);
    expect(leer()).toEqual([1, 3]);
    limpiar();
    expect(leer()).toEqual([]);
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it("el servidor siempre ve una lista vacía", () => {
    escribir([1]);
    expect(leerServidor()).toEqual([]);
  });

  it("suscribir avisa en la misma pestaña y con el evento storage de otra pestaña", () => {
    const callback = vi.fn();
    const cancelar = suscribir(callback);
    alternar(9);
    expect(callback).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent("storage", { key: CLAVE }));
    expect(callback).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new StorageEvent("storage", { key: "otra-clave" }));
    expect(callback).toHaveBeenCalledTimes(2);
    cancelar();
    alternar(9);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("con localStorage bloqueado funciona en memoria y sin lanzar errores", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    expect(disponible()).toBe(false);
    expect(() => alternar(3)).not.toThrow();
    expect(leer()).toEqual([3]);
  });

  it("disponible() es true con localStorage normal", () => {
    expect(disponible()).toBe(true);
  });
});

describe("hooks", () => {
  it("useFavoritos se actualiza al alternar", () => {
    const { result } = renderHook(() => useFavoritos());
    expect(result.current.total).toBe(0);
    act(() => {
      result.current.alternar(4);
    });
    expect(result.current.ids).toEqual([4]);
    expect(result.current.esFavorito(4)).toBe(true);
  });

  it("useFavoritos refleja cambios hechos en otra pestaña", () => {
    const { result } = renderHook(() => useFavoritos());
    act(() => {
      localStorage.setItem(CLAVE, "[42]");
      window.dispatchEvent(new StorageEvent("storage", { key: CLAVE }));
    });
    expect(result.current.ids).toEqual([42]);
  });

  it("useDebounce espera 400 ms", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "m" },
    });
    rerender({ v: "mo" });
    rerender({ v: "morty" });
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current).toBe("m");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("morty");
  });
});
