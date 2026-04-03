import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const standaloneNextDir = path.join(nextDir, "standalone", ".next");
const buildManifestPath = path.join(nextDir, "build-manifest.json");

if (!existsSync(buildManifestPath)) {
  throw new Error("build-manifest.json tidak ditemukan. Jalankan build terlebih dahulu.");
}

const manifest = JSON.parse(readFileSync(buildManifestPath, "utf8"));
const appFiles = new Set([
  ...(manifest.polyfillFiles || []),
  ...(manifest.lowPriorityFiles || []),
  ...(manifest.rootMainFiles || []),
]);

if (appFiles.size === 0) {
  throw new Error("Tidak ada asset static yang ditemukan di build manifest.");
}

const missing = [];
for (const asset of appFiles) {
  const standaloneAssetPath = path.join(standaloneNextDir, asset);
  if (!existsSync(standaloneAssetPath)) {
    missing.push(asset);
  }
}

if (missing.length > 0) {
  throw new Error(`Asset standalone hilang: ${missing.slice(0, 5).join(", ")}`);
}

console.log(`Standalone asset check passed (${appFiles.size} assets verified).`);
