#!/usr/bin/env node

/**
 * Convert .webp recipe images to .jpg and update project references.
 *
 * What it does:
 * 1) Recursively finds .webp files in the target image directory
 * 2) Converts them to .jpg using sharp
 * 3) Recursively scans project source files and replaces ".webp" with ".jpg"
 *
 * Notes:
 * - Intended for recipe/food photos, not transparent icons/logos
 * - Review EXCLUDE_DIRS / EXCLUDE_FILE_PATTERNS before running
 *
 * Usage:
 *   node scripts/convert-webp-to-jpg-and-update-refs.js
 *
 * Optional env vars:
 *   IMAGES_DIR=public/images
 *   PROJECT_ROOT=.
 *   DELETE_ORIGINALS=true
 */

const fs = require("fs");
const path = require("path");

let sharp;
try {
  sharp = require("sharp");
} catch (err) {
  console.error(
    'Missing dependency: "sharp". Install it with:\n\n  npm install -D sharp\n'
  );
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(process.env.PROJECT_ROOT || ".");
const IMAGES_DIR = path.resolve(process.env.IMAGES_DIR || "public/images");
const DELETE_ORIGINALS = String(process.env.DELETE_ORIGINALS || "false").toLowerCase() === "true";

const SOURCE_FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".html",
  ".css",
  ".md",
  ".yml",
  ".yaml",
]);

const EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".vercel",
  "coverage",
  "android",
  "ios/App/App/public",
]);

const EXCLUDE_FILE_PATTERNS = [
  /icon/i,
  /logo/i,
  /favicon/i,
  /splash/i,
  /banner/i,
];

async function pathExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir, fileList = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      await walk(fullPath, fileList);
      continue;
    }

    fileList.push(fullPath);
  }
  return fileList;
}

function shouldSkipImage(filePath) {
  const base = path.basename(filePath);
  return EXCLUDE_FILE_PATTERNS.some((pattern) => pattern.test(base));
}

async function convertWebpToJpg(webpPath) {
  const jpgPath = webpPath.replace(/\.webp$/i, ".jpg");

  if (await pathExists(jpgPath)) {
    console.log(`SKIP existing jpg: ${path.relative(PROJECT_ROOT, jpgPath)}`);
    return { converted: false, jpgPath };
  }

  await sharp(webpPath)
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toFile(jpgPath);

  console.log(`CONVERT ${path.relative(PROJECT_ROOT, webpPath)} -> ${path.relative(PROJECT_ROOT, jpgPath)}`);

  if (DELETE_ORIGINALS) {
    await fs.promises.unlink(webpPath);
    console.log(`DELETE  ${path.relative(PROJECT_ROOT, webpPath)}`);
  }

  return { converted: true, jpgPath };
}

async function updateReferences(files) {
  let updatedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!SOURCE_FILE_EXTENSIONS.has(ext)) continue;

    const original = await fs.promises.readFile(file, "utf8");
    if (!original.includes(".webp")) continue;

    const updated = original.replace(/\.webp\b/g, ".jpg");
    if (updated === original) continue;

    await fs.promises.writeFile(file, updated, "utf8");
    console.log(`UPDATE  refs in ${path.relative(PROJECT_ROOT, file)}`);
    updatedCount++;
  }

  return updatedCount;
}

async function main() {
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Images dir:    ${IMAGES_DIR}`);
  console.log(`Delete .webp:  ${DELETE_ORIGINALS ? "yes" : "no"}`);
  console.log("");

  if (!(await pathExists(IMAGES_DIR))) {
    throw new Error(`Images directory not found: ${IMAGES_DIR}`);
  }

  const imageFiles = await walk(IMAGES_DIR);
  const webpFiles = imageFiles.filter((file) => /\.webp$/i.test(file));

  if (webpFiles.length === 0) {
    console.log("No .webp files found.");
  } else {
    console.log(`Found ${webpFiles.length} .webp files.\n`);
  }

  let convertedCount = 0;
  let skippedCount = 0;

  for (const file of webpFiles) {
    if (shouldSkipImage(file)) {
      console.log(`SKIP excluded: ${path.relative(PROJECT_ROOT, file)}`);
      skippedCount++;
      continue;
    }

    const result = await convertWebpToJpg(file);
    if (result.converted) convertedCount++;
  }

  console.log("");
  console.log("Scanning project files for .webp references...\n");

  const projectFiles = await walk(PROJECT_ROOT);
  
  const updatedRefs = await updateReferences(projectFiles);

  console.log("");
  console.log("Done.");
  console.log(`Converted images: ${convertedCount}`);
  console.log(`Skipped images:   ${skippedCount}`);
  console.log(`Updated files:    ${updatedRefs}`);
  console.log("");

  console.log("Next steps:");
  console.log("1) Review a few converted images");
  console.log("2) Run your build");
  console.log("3) Sync Capacitor again");
  console.log("4) Test on iOS");
}

main().catch((err) => {
  console.error("\nERROR:");
  console.error(err.message || err);
  process.exit(1);
});