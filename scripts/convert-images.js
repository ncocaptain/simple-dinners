import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "../public/images");

// set to true if you want originals removed after successful conversion
const DELETE_ORIGINALS = false;

// output sizing / quality
const MAX_WIDTH = 800;
const QUALITY = 80;

async function convertImages() {
  try {
    if (!fs.existsSync(inputDir)) {
      console.log(`Images folder not found: ${inputDir}`);
      return;
    }

    const files = fs.readdirSync(inputDir);

    const imageFiles = files.filter((file) => /\.(png|jpe?g)$/i.test(file));

    if (imageFiles.length === 0) {
      console.log("No PNG/JPG/JPEG files found.");
      return;
    }

    console.log(`Found ${imageFiles.length} source images...`);

    let converted = 0;
    let skipped = 0;
    let deleted = 0;
    let failed = 0;

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputFile = file.replace(/\.(png|jpe?g)$/i, ".jpg");
      const outputPath = path.join(inputDir, outputFile);

      try {
        if (fs.existsSync(outputPath)) {
          console.log(`Skipped (already exists): ${outputFile}`);
          skipped++;
          continue;
        }

        await sharp(inputPath)
          .resize({
            width: MAX_WIDTH,
            withoutEnlargement: true,
          })
          .jpg({ quality: QUALITY })
          .toFile(outputPath);

        console.log(`Converted: ${file} -> ${outputFile}`);
        converted++;

        if (DELETE_ORIGINALS) {
          fs.unlinkSync(inputPath);
          console.log(`Deleted original: ${file}`);
          deleted++;
        }
      } catch (err) {
        console.error(`Failed: ${file}`, err);
        failed++;
      }
    }

    console.log("");
    console.log("=== Conversion Summary ===");
    console.log(`Converted: ${converted}`);
    console.log(`Skipped:   ${skipped}`);
    console.log(`Deleted:   ${deleted}`);
    console.log(`Failed:    ${failed}`);
    console.log("✅ Done!");
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

convertImages();