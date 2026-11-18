import { expect, test } from "@playwright/test";

/** Criterios de aceptación de la sección 8 del enunciado, automatizados. */

test("1 · /?name=rick&status=alive&page=2 muestra esa página con los controles cargados", async ({
  page,
}) => {
  await page.goto("/?name=rick&status=alive&page=2");
  await expect(page.getByRole("searchbox", { name: "Nombre" })).toHaveValue("rick");
  await expect(page.getByRole("combobox", { name: "Estado" })).toHaveValue("alive");
  const paginacion = page.getByRole("navigation", { name: "Paginación" });
  await expect(paginacion).toContainText(/Página 2 de \d+/);
  await page.reload();
  await expect(paginacion).toContainText(/Página 2 de \d+/);
});

test("1b · escribir «morty» produce UNA actualización de la URL y vuelve a page=1", async ({
  page,
}) => {
  await page.goto("/?page=3");
  const cambios: string[] = [];
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) cambios.push(f.url());
  });
  await page.getByRole("searchbox", { name: "Nombre" }).pressSequentially("morty", { delay: 60 });
  await expect(page).toHaveURL(/\?name=morty$/);
  await page.waitForTimeout(600);
  expect(cambios.filter((u) => u.includes("name=")).length).toBe(1);
  await expect(page.getByRole("status").first()).toContainText("personajes encontrados");
});

test("2 · buscar «zzzz» muestra el estado vacío, no la pantalla de error", async ({ page }) => {
  await page.goto("/?name=zzzz");
  await expect(
    page.getByRole("heading", { name: "Ningún personaje coincide con esa búsqueda" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Limpiar los filtros" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reintentar" })).toHaveCount(0);
});

test("4 · el detalle del personaje 1 pide los episodios con UNA petición", async ({ page }) => {
  await page.goto("/personaje/1");
  await expect(page.getByRole("heading", { level: 1, name: "Rick Sanchez" })).toBeVisible();
  await expect(page.getByText("Pilot", { exact: true }).first()).toBeVisible();
  await expect(page.locator("dl")).toContainText("Earth (C-137)");
  // La petición ocurre en el servidor: se comprueba en src/lib/api.ts (pruebas
  // Vitest) y en la consola del servidor. Aquí se valida el resultado completo.
  await expect(
    page.getByRole("heading", { name: /Episodios en los que aparece \(51\)/ }),
  ).toBeVisible();
});

for (const ruta of ["/personaje/99999", "/personaje/abc"]) {
  test(`5 · ${ruta} muestra «no encontrado»`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { name: "Personaje no encontrado" })).toBeVisible();
  });
}

test("6 · un favorito marcado en una pestaña aparece y desaparece en otra", async ({ context }) => {
  const lista = await context.newPage();
  const favoritos = await context.newPage();
  await favoritos.goto("/favoritos");
  await expect(
    favoritos.getByRole("heading", { name: "Aún no ha guardado personajes" }),
  ).toBeVisible();

  await lista.goto("/?name=rick+sanchez");
  await lista.getByRole("button", { name: "Agregar a Rick Sanchez a favoritos" }).first().click();

  await expect(favoritos.getByRole("heading", { name: "Rick Sanchez" })).toBeVisible();

  await lista.getByRole("button", { name: "Quitar a Rick Sanchez de favoritos" }).first().click();
  await expect(favoritos.getByRole("heading", { name: "Rick Sanchez" })).toHaveCount(0);
});

test("7 · con localStorage bloqueado la app funciona y no hay errores en consola", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("bloqueado", "SecurityError");
      },
    });
  });
  const page = await context.newPage();
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));

  await page.goto("/?name=morty+smith");
  const boton = page.getByRole("button", { name: "Agregar a Morty Smith a favoritos" }).first();
  await boton.click();
  await expect(
    page.getByRole("button", { name: "Quitar a Morty Smith de favoritos" }).first(),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/favoritos");
  await expect(page.getByRole("heading", { level: 1, name: "Mis favoritos" })).toBeVisible();
  expect(errores).toEqual([]);
  await context.close();
});

test("extra · «Al azar» abre el portal de carga y llega a un personaje", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.getByRole("link", { name: "Al azar" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /portal|dimensión|multiverso|coordenadas/i })
      .first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/personaje\/\d+$/);
  await expect(page.locator("main h1")).toBeVisible();
});
