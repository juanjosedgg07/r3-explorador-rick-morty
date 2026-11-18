import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1024, height: 800 }, colorScheme: "dark" });
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const ids = async () =>
  p.$$eval("main ul li img", (imgs) =>
    imgs.slice(0, 5).map((i) => decodeURIComponent(i.src).match(/avatar\/(\d+)/)?.[1]),
  );
console.log("vuelta 1:", await ids());
await p.waitForTimeout(12600);
console.log("vuelta 2:", await ids());
await p.screenshot({ path: "calidad/capturas/orbita-vuelta-2.png" });
await b.close();
