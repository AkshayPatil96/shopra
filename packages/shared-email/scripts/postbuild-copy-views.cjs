#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'views');
const destDir = path.join(__dirname, '..', 'dist', 'views');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, destDir);
console.log(`[shared-email] Copied views to dist (${destDir})`);
