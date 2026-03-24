import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// change this if your file lives somewhere else
const targetFile = path.join(__dirname, "../src/core/data.ts");

function updatePhotoUrls() {
  try {
    if (!fs.existsSync(targetFile)) {
      console.log(`Target file not found: ${targetFile}`);
      return;
    }

    const original = fs.readFileSync(targetFile, "utf8");

    const updated = original.replace(
      /photoUrl:\s*"(\/images\/[^"]+)\.(png|jpg|jpeg)"/gi,
      'photoUrl: "$1.webp"'
    );

    if (updated === original) {
      console.log("No photoUrl extensions needed updating.");
      return;
    }

    fs.writeFileSync(targetFile, updated, "utf8");
    console.log(`Updated photoUrl values to .webp in: ${targetFile}`);
    console.log("✅ Done!");
  } catch (err) {
    console.error("Error updating photoUrl values:", err);
  }
}

updatePhotoUrls();