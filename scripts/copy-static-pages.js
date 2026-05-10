import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const filesToCopy = [
  ["about.html", "dist/about.html"],
  ["privacy-policy.html", "dist/privacy-policy.html"],
  ["terms.html", "dist/terms.html"],
];

for (const [from, to] of filesToCopy) {
  const sourcePath = resolve(from);
  const targetPath = resolve(to);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${from} -> ${to}`);
}
