import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "../recipe-image-source");
const outputDir = path.join(__dirname, "../public/images");

const MAX_WIDTH = 800;
const QUALITY = 78;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function clearGeneratedImages(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (/\.(png|jpe?g|webp)$/i.test(file)) {
      fs.unlinkSync(path.join(dir, file));
    }
  }
}

async function buildAndroidWebpImages() {
  try {
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source folder not found: ${sourceDir}`);
      process.exit(1);
    }

    ensureDir(outputDir);
    clearGeneratedImages(outputDir);

    const files = fs
      .readdirSync(sourceDir)
      .filter((file) => /\.(png|jpe?g|webp)$/i.test(file));

    if (files.length === 0) {
      console.log("No source images found.");
      return;
    }

    let converted = 0;
    let failed = 0;

    console.log(`Building Android WebP images from ${files.length} source files...`);

    for (const file of files) {
      const inputPath = path.join(sourceDir, file);
      const baseName = path.parse(file).name;
      const outputPath = path.join(outputDir, `${baseName}.webp`);

      try {
        await sharp(inputPath)
          .resize({
            width: MAX_WIDTH,
            withoutEnlargement: true,
          })
          .webp({ quality: QUALITY })
          .toFile(outputPath);

        converted++;
        console.log(`✅ ${file} -> ${baseName}.webp`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed: ${file}`, err);
      }
    }

    console.log("");
    console.log("=== Android Image Build Summary ===");
    console.log(`Converted: ${converted}`);
    console.log(`Failed:    ${failed}`);
    console.log("Done.");
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

buildAndroidWebpImages();