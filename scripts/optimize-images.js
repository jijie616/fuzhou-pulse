/**
 * Image optimization script for Fuzhou Pulse.
 *
 * Usage:
 *   npm install sharp
 *   node scripts/optimize-images.js
 *
 * This script:
 * 1. Reads PNG/JPG files from web/assets/images/
 * 2. Resizes images larger than MAX_WIDTH to MAX_WIDTH
 * 3. Converts PNG >500KB to compressed JPEG at quality 85
 * 4. Compresses existing JPEGs at quality 85
 * 5. Outputs optimized images to web/assets/images/ (overwrites originals)
 * 6. Reports total size savings
 *
 * Run a backup of web/assets/images/ first if you want to keep originals.
 */

const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "..", "web", "assets", "images");
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 85;
const PNG_SIZE_THRESHOLD = 500 * 1024; // 500KB

let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("sharp is not installed. Run: npm install sharp");
  console.error("Then re-run: node scripts/optimize-images.js");
  process.exit(1);
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;
  const image = sharp(filePath);
  const metadata = await image.metadata();

  let pipeline = image;

  // Resize if wider than MAX_WIDTH
  if (metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH);
  }

  // Convert large PNGs to JPEG for size reduction
  if (ext === ".png" && originalSize > PNG_SIZE_THRESHOLD) {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY });
    const newPath = filePath.replace(/\.png$/i, ".jpg");
    await pipeline.toFile(newPath);
    // Remove original large PNG
    fs.unlinkSync(filePath);
    const newSize = fs.statSync(newPath).size;
    const saved = originalSize - newSize;
    console.log(
      path.basename(filePath) + " -> " + path.basename(newPath) +
      " | " + formatSize(originalSize) + " -> " + formatSize(newSize) +
      " | saved " + formatSize(saved) + " (" + (saved / originalSize * 100).toFixed(0) + "%)"
    );
    return { original: originalSize, optimized: newSize, converted: true };
  }

  // Compress JPEGs in-place
  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY });
  }

  // Compress PNGs that stay as PNG
  if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  }

  const tmpPath = filePath + ".tmp";
  await pipeline.toFile(tmpPath);
  const optimizedSize = fs.statSync(tmpPath).size;

  if (optimizedSize < originalSize) {
    fs.renameSync(tmpPath, filePath);
    const saved = originalSize - optimizedSize;
    console.log(
      path.basename(filePath) +
      " | " + formatSize(originalSize) + " -> " + formatSize(optimizedSize) +
      " | saved " + formatSize(saved) + " (" + (saved / originalSize * 100).toFixed(0) + "%)"
    );
  } else {
    fs.unlinkSync(tmpPath);
    console.log(path.basename(filePath) + " | already optimal (" + formatSize(originalSize) + ")");
  }

  return { original: originalSize, optimized: originalSize > optimizedSize ? optimizedSize : originalSize, converted: false };
}

async function main() {
  console.log("Fuzhou Pulse - Image Optimizer\n");

  const files = fs.readdirSync(INPUT_DIR)
    .filter(function (f) { return /\.(png|jpe?g)$/i.test(f); })
    .map(function (f) { return path.join(INPUT_DIR, f); });

  console.log("Found " + files.length + " images to process.\n");

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    try {
      const result = await optimizeImage(file);
      totalOriginal += result.original;
      totalOptimized += result.optimized;
    } catch (e) {
      console.error("Error processing " + path.basename(file) + ":", e.message);
    }
  }

  const totalSaved = totalOriginal - totalOptimized;
  console.log(
    "\nDone! Total: " + formatSize(totalOriginal) + " -> " + formatSize(totalOptimized) +
    " | Saved " + formatSize(totalSaved) + " (" + (totalSaved / totalOriginal * 100).toFixed(0) + "%)"
  );
}

main().catch(console.error);
