import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const standaloneDir = path.join(nextDir, "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next");
const staticSourceDir = path.join(nextDir, "static");
const staticTargetDir = path.join(standaloneNextDir, "static");
const publicSourceDir = path.join(projectRoot, "public");
const publicTargetDir = path.join(standaloneDir, "public");

if (!existsSync(standaloneDir)) {
  throw new Error("Standalone output tidak ditemukan. Jalankan `next build` terlebih dahulu.");
}

mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticSourceDir)) {
  cpSync(staticSourceDir, staticTargetDir, {
    recursive: true,
    force: true,
  });
  console.log(`Copied standalone static assets -> ${path.relative(projectRoot, staticTargetDir)}`);
} else {
  throw new Error("Folder `.next/static` tidak ditemukan.");
}

if (existsSync(publicSourceDir)) {
  cpSync(publicSourceDir, publicTargetDir, {
    recursive: true,
    force: true,
  });
  console.log(`Copied public assets -> ${path.relative(projectRoot, publicTargetDir)}`);
} else {
  console.log("No public directory found, skipping public asset copy.");
}
