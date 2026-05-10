// ============================================
// GENERATE-SITEMAP.JS — Build-time Sitemap Generator
// ============================================
// Usage: node scripts/generate-sitemap.js
// Output: public/sitemap.xml

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ROUTES } from "../src/js/routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DOMAIN = "https://docker.wystone.tech";
const TODAY = new Date().toISOString().split("T")[0];

function generateSitemap() {
  // Filter out 'overview' to avoid duplication (already hardcoded below as home)
  const uniqueRoutes = ROUTES.filter(
    (route) => route.path && route.key !== "overview",
  );
  const urls = uniqueRoutes
    .map(
      (r) => `  <url>
    <loc>${DOMAIN}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;

  const outPath = resolve(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`✅ Sitemap generated → ${outPath}`);
  console.log(`   ${uniqueRoutes.length + 1} URLs included.`);
}

generateSitemap();
