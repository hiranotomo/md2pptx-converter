#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../../core/templates');
const targetDir = path.join(__dirname, '../public/templates');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all JSON files
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

console.log(`Copying ${files.length} template files to public/templates...`);

files.forEach(file => {
  const source = path.join(sourceDir, file);
  const target = path.join(targetDir, file);
  fs.copyFileSync(source, target);
  console.log(`  ✓ ${file}`);
});

console.log('Template files copied successfully!');
