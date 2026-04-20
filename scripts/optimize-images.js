import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// CONFIG
// =====================================================

const imageDir = path.join(__dirname, "../public/images");
const dataFile = path.join(__dirname, "../src/core/data.ts");

const DELETE_ORIGINALS = true;
const MAX_WIDTH = 800;
const QUALITY = 80;

// =====================================================
// IMAGE CONVERSION
// =====================================================

async function convertImages() {
  const files = fs.readdirSync(imageDir);
  const imageFiles = files.filter((f) => /\.(png|jpe?g)$/i.test(f));

  let converted = 0;
  let skipped = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(imageDir, file);
    const outputFile = file.replace(/\.(png|jpe?g)$/i, ".jpg");
    const outputPath = path.join(imageDir, outputFile);

    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpg({ quality: QUALITY })
      .toFile(outputPath);

    console.log(`Converted: ${file} → ${outputFile}`);
    converted++;

    if (DELETE_ORIGINALS) {
      fs.unlinkSync(inputPath);
      console.log(`Deleted: ${file}`);
    }
  }

  console.log(`\nImages → Converted: ${converted}, Skipped: ${skipped}`);
}

// =====================================================
// UPDATE DATA FILE
// =====================================================

function updatePhotoUrls() {
  if (!fs.existsSync(dataFile)) {
    console.log("data.ts not found, skipping URL update.");
    return;
  }

  const original = fs.readFileSync(dataFile, "utf8");

  const updated = original.replace(
    /photoUrl:\s*"(\/images\/[^"]+)\.(png|jpg|jpeg)"/gi,
    'photoUrl: "$1.jpg"'
  );

  if (updated !== original) {
    fs.writeFileSync(dataFile, updated, "utf8");
    console.log("Updated photoUrl → .jpg");
  } else {
    console.log("No photoUrl updates needed.");
  }
}

// =====================================================
// RUN EVERYTHING
// =====================================================

async function run() {
  console.log("🚀 Optimizing images...\n");

  await convertImages();
  updatePhotoUrls();

  console.log("\n✅ All done!");
}

run();