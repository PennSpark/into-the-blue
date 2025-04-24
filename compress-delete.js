const fs = require('fs');
const path = require('path');
const glob = require('glob');

const dryRun = false; // Set to false to actually delete files!

// Find all image files recursively
const files = glob.sync('./public/**/*.{png,jpg,jpeg}', { nodir: true });

files.forEach((file) => {
  if (dryRun) {
    console.log(`[DRY RUN] Would delete: ${file}`);
  } else {
    try {
      fs.unlinkSync(file);
      console.log(`🗑️ Deleted: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to delete ${file}:`, err);
    }
  }
});
