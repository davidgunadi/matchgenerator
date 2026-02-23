import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sourceDir = resolve("client", "dist");
const targetDir = resolve("android", "app", "src", "main", "assets", "www");

if (!existsSync(sourceDir)) {
  throw new Error("client/dist does not exist. Run npm run build --prefix client first.");
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Copied ${sourceDir} -> ${targetDir}`);
