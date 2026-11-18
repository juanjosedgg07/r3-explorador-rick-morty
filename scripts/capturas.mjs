import { chromium } from "@playwright/test";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const rutas = [
  ["inicio", "/"],
  ["detalle", "/personaje/1"],
  ["favoritos", "/favoritos"],
];
const anchos = (process.env.ANCHOS ?? "360,768,1024").split(",").map(Number);
const esquema = process.env.ESQUEMA ?? "dark";
const navegador = await chromium.launch();
for (const ancho of anchos) {
  const pagina = await navegador.newPage({
    viewport: { width: ancho, height: 900 },
    colorScheme: esquema,
    reducedMotion: "reduce",
  });
  for (const [nombre, ruta] of rutas) {
    await pagina.goto(base + ruta, { waitUntil: "networkidle" });
    await pagina.screenshot({
      path: `calidad/capturas/${nombre}-${ancho}-${esquema}.png`,
      fullPage: process.env.COMPLETA === "1",
    });
  }
  await pagina.close();
}
await navegador.close();
console.log("capturas listas");
