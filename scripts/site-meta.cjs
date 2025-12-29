const fs = require("fs");
const path = require("path");

const mode = process.argv[2];
const allowedModes = new Set(["2marines", "shieldmate", "marinecoin"]);

if (!allowedModes.has(mode)) {
  console.error("Usage: node scripts/site-meta.cjs <2marines|shieldmate|marinecoin>");
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const sourceDir = path.join(projectRoot, "public", "site-meta", mode);

if (!fs.existsSync(distDir)) {
  console.error("dist/ not found. Run the Vite build first.");
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Missing site-meta source: ${sourceDir}`);
  process.exit(1);
}

const assets = ["og.png", "favicon.ico", "apple-touch-icon.png"];

for (const asset of assets) {
  const sourcePath = path.join(sourceDir, asset);
  const targetPath = path.join(distDir, asset);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing asset: ${sourcePath}`);
    process.exit(1);
  }

  fs.copyFileSync(sourcePath, targetPath);
}

const distSiteMeta = path.join(distDir, "site-meta");
if (fs.existsSync(distSiteMeta)) {
  fs.rmSync(distSiteMeta, { recursive: true, force: true });
}
