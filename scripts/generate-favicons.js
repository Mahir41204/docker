import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

async function renderSvgToPng(svgPath, outPath, size) {
  const svg = fs.readFileSync(svgPath, "utf8");
  const svgWithSize = svg.replace(
    /<svg([^>]+)>/,
    `<svg$1 width="${size}" height="${size}">`,
  );
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0}</style></head><body>${svgWithSize}</body></html>`;
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size });
  await page.setContent(html, { waitUntil: "networkidle0" });
  const el = await page.$("svg");
  if (!el) throw new Error("SVG element not found");
  await el.screenshot({ path: outPath });
  await browser.close();
}

(async () => {
  try {
    const publicDir = path.resolve("public");
    const svgPath = path.join(publicDir, "favicon.svg");
    if (!fs.existsSync(svgPath)) {
      console.error("favicon.svg not found in public/");
      process.exit(1);
    }
    const out192 = path.join(publicDir, "favicon-192.png");
    const out512 = path.join(publicDir, "favicon-512.png");
    console.log("Rendering favicon 192x192...");
    await renderSvgToPng(svgPath, out192, 192);
    console.log("Rendering favicon 512x512...");
    await renderSvgToPng(svgPath, out512, 512);
    console.log("Favicons generated:", out192, out512);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
