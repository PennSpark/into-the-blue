const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

const dryRun = false; // 🔁 Set to `false` to actually convert files

// Recursively find image files
const files = glob.sync('./public/**/*.{jpg,jpeg,png}', { nodir: true });

files.forEach(async (file) => {
  const outputPath = file
    .replace(/^\.\/public/, './compressed')
    .replace(/\.(jpg|jpeg|png)$/i, '.webp');

  console.log(`${dryRun ? '[DRY RUN]' : '[CONVERT]'} ${file} → ${outputPath}`);

  if (!dryRun) {
    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    try {
      await sharp(file)
        .toFormat('webp')
        .toFile(outputPath);
    } catch (err) {
      console.error(`❌ Failed to convert ${file}:`, err);
    }
  }
});
