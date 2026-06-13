import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "../recipe-image-source");
const outputDir = path.join(__dirname, "../public/images");

const MAX_WIDTH = 800;
const JPG_QUALITY = 82;
const WEBP_QUALITY = 78;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Picks one source image per recipe name.
// If both .jpg and .webp exist in recipe-image-source,
// it prefers .jpg/.jpeg/.png as the clean source.
function getUniqueSourceImages(files) {
  const byBaseName = new Map();

  for (const file of files) {
    const parsed = path.parse(file);
    const baseName = parsed.name;
    const ext = parsed.ext.toLowerCase();

    const existing = byBaseName.get(baseName);

    if (!existing) {
      byBaseName.set(baseName, file);
      continue;
    }

    const existingExt = path.parse(existing).ext.toLowerCase();

    const currentIsPreferred = [".jpg", ".jpeg", ".png"].includes(ext);
    const existingIsPreferred = [".jpg", ".jpeg", ".png"].includes(existingExt);

    if (currentIsPreferred && !existingIsPreferred) {
      byBaseName.set(baseName, file);
    }
  }

  return Array.from(byBaseName.values());
}

// Only clears generated files for the recipes being rebuilt.
// This avoids randomly wiping unrelated image assets.
function clearGeneratedImagesForSources(dir, sourceFiles) {
  if (!fs.existsSync(dir)) return;

  for (const file of sourceFiles) {
    const baseName = path.parse(file).name;

    const jpgPath = path.join(dir, `${baseName}.jpg`);
    const webpPath = path.join(dir, `${baseName}.webp`);

    if (fs.existsSync(jpgPath)) {
      fs.unlinkSync(jpgPath);
    }

    if (fs.existsSync(webpPath)) {
      fs.unlinkSync(webpPath);
    }
  }
}

async function buildRecipeImages() {
  try {
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source folder not found: ${sourceDir}`);
      process.exit(1);
    }

    ensureDir(outputDir);

    const sourceFiles = fs
      .readdirSync(sourceDir)
      .filter((file) => /\.(png|jpe?g|webp)$/i.test(file));

    const files = getUniqueSourceImages(sourceFiles);

    if (files.length === 0) {
      console.log("No source images found.");
      return;
    }

    clearGeneratedImagesForSources(outputDir, files);

    let jpgConverted = 0;
    let webpConverted = 0;
    let failed = 0;

    console.log(
      `Building JPG + WebP recipe images from ${files.length} source files...`
    );

    for (const file of files) {
      const inputPath = path.join(sourceDir, file);
      const baseName = path.parse(file).name;

      const jpgOutputPath = path.join(outputDir, `${baseName}.jpg`);
      const webpOutputPath = path.join(outputDir, `${baseName}.webp`);

      try {
        const image = sharp(inputPath).resize({
          width: MAX_WIDTH,
          withoutEnlargement: true,
        });

        await Promise.all([
          image.clone().jpeg({ quality: JPG_QUALITY }).toFile(jpgOutputPath),
          image.clone().webp({ quality: WEBP_QUALITY }).toFile(webpOutputPath),
        ]);

        jpgConverted++;
        webpConverted++;

        console.log(`✅ ${file} -> ${baseName}.jpg + ${baseName}.webp`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed: ${file}`, err);
      }
    }

    console.log("");
    console.log("=== Recipe Image Build Summary ===");
    console.log(`JPG created:  ${jpgConverted}`);
    console.log(`WebP created: ${webpConverted}`);
    console.log(`Failed:       ${failed}`);
    console.log("Done.");
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

buildRecipeImages();