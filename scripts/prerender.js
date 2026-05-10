import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import { ROUTES } from "../src/js/routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PORT = process.env.PRERENDER_PORT
  ? Number(process.env.PRERENDER_PORT)
  : 4174;

function contentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

async function serve() {
  const server = http.createServer(async (req, res) => {
    try {
      let reqPath = decodeURIComponent(
        new URL(req.url, `http://localhost`).pathname,
      );
      if (reqPath === "/") reqPath = "/index.html";
      const filePath = path.join(DIST, reqPath);
      let stats;
      try {
        stats = await fs.stat(filePath);
      } catch (e) {
        stats = null;
      }
      if (!stats) {
        const fallback = path.join(DIST, "index.html");
        try {
          const fallbackData = await fs.readFile(fallback);
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(fallbackData);
          return;
        } catch (fallbackError) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found");
          return;
        }
      }
      const data = await fs.readFile(filePath);
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(PORT, () => resolve(server));
  });
}

async function prerender() {
  // Ensure dist exists
  try {
    const s = await fs.stat(DIST);
    if (!s.isDirectory()) throw new Error("dist is not a directory");
  } catch (e) {
    console.error(
      "Prerender failed: built `dist` directory not found. Run the build first.",
    );
    process.exit(1);
  }

  const server = await serve();
  const url = `http://localhost:${PORT}/`;
  console.log("Prerender: serving", DIST, "on", url);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    for (const route of ROUTES) {
      const targetUrl = route.path === "/" ? url : `${url}${route.path}`;
      await page.goto(targetUrl, { waitUntil: "networkidle2" });
      await page
        .waitForFunction(
          (expectedRoute) =>
            window.__app?.router?.getCurrentRoute?.() === expectedRoute,
          { timeout: 30000 },
          route.key,
        )
        .catch(() => {});
      await page.waitForTimeout(250);
      const html = await page.content();
      const out =
        route.path === "/"
          ? path.join(DIST, "index.html")
          : path.join(DIST, route.path.slice(1), "index.html");
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, html, "utf8");
      console.log("Prerender: wrote snapshot to", out);
    }
  } catch (err) {
    console.error("Prerender error:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

prerender();
