// ============================================
// GENERATE-SITEMAP.JS — Build-time Sitemap Generator
// ============================================
// Usage: node scripts/generate-sitemap.js
// Output: public/sitemap.xml

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DOMAIN = 'https://docker-learning-hub.com';
const TODAY = new Date().toISOString().split('T')[0];

// All routes in the SPA
const routes = [
  { path: 'quick-notes',    priority: '0.8', changefreq: 'weekly' },
  { path: 'overview',       priority: '1.0', changefreq: 'monthly' },
  { path: 'level-0',        priority: '0.9', changefreq: 'monthly' },
  { path: 'level-1',        priority: '0.9', changefreq: 'monthly' },
  { path: 'level-2',        priority: '0.9', changefreq: 'monthly' },
  { path: 'level-3',        priority: '0.9', changefreq: 'monthly' },
  { path: 'level-4',        priority: '0.9', changefreq: 'monthly' },
  { path: 'compose',        priority: '0.8', changefreq: 'monthly' },
  { path: 'features',       priority: '0.7', changefreq: 'monthly' },
  { path: 'tools',          priority: '0.7', changefreq: 'monthly' },
  { path: 'integrations',   priority: '0.7', changefreq: 'monthly' },
  { path: 'languages',      priority: '0.7', changefreq: 'monthly' },
  { path: 'implementation', priority: '0.8', changefreq: 'monthly' },
  { path: 'guides',         priority: '0.8', changefreq: 'weekly' },
  { path: 'system-design',  priority: '0.8', changefreq: 'monthly' },
  { path: 'mistakes',       priority: '0.7', changefreq: 'monthly' },
  { path: 'glossary',       priority: '0.6', changefreq: 'monthly' },
  { path: 'resources',      priority: '0.6', changefreq: 'monthly' },
];

function generateSitemap() {
  const urls = routes.map(r => `  <url>
    <loc>${DOMAIN}/#${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

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

  const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`✅ Sitemap generated → ${outPath}`);
  console.log(`   ${routes.length + 1} URLs included.`);
}

generateSitemap();
