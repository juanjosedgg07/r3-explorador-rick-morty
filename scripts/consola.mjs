import { chromium } from "@playwright/test";
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
const mensajes = [];
pagina.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) mensajes.push(`${m.type()}: ${m.text()}`);
});
pagina.on("pageerror", (e) => mensajes.push(`pageerror: ${e.message}`));
for (const r of (process.argv[2] ?? "/,/personaje/1,/favoritos").split(",")) {
  await pagina.goto("http://localhost:3000" + r, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(800);
  const foco = await pagina.evaluate(() => document.activeElement?.tagName);
  console.log(r, "foco:", foco);
}
console.log(mensajes.join("\n") || "sin errores en consola");
await navegador.close();
