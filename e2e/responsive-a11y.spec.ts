import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Reto de excelencia: 3 anchos sin scroll horizontal y 0 violaciones de axe. */
const ANCHOS = [360, 768, 1024] as const;
const RUTAS = ["/", "/personaje/1", "/favoritos", "/?name=zzzz", "/personaje/abc"] as const;
const TEMAS = ["light", "dark"] as const;

for (const ancho of ANCHOS) {
  for (const tema of TEMAS) {
    test.describe(`${ancho}px · ${tema}`, () => {
      test.use({ viewport: { width: ancho, height: 900 }, colorScheme: tema });

      for (const ruta of RUTAS) {
        test(`${ruta}: sin scroll horizontal y sin violaciones WCAG 2.2 AA`, async ({ page }) => {
          await page.goto(ruta, { waitUntil: "networkidle" });
          await expect(page.locator("main h1")).toBeVisible();

          const desborde = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(desborde, "scroll horizontal").toBeLessThanOrEqual(0);

          const { violations } = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)).toEqual([]);
        });
      }
    });
  }
}

test("reflow a 320 px (WCAG 1.4.10) en la portada", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  const desborde = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(desborde).toBeLessThanOrEqual(0);
});

test("tema de alto contraste sin violaciones de contraste", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("r3:tema", "contrast"));
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "contrast");
  const { violations } = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
  expect(violations).toEqual([]);
});

test("solo con teclado: saltar al contenido y foco visible", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#contenido")).toBeFocused();
  await page.keyboard.press("/");
  await expect(page.getByRole("searchbox", { name: "Nombre" })).toBeFocused();
});
