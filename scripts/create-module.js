#!/usr/bin/env node

/**
 * Module Creation Script
 * Usage: node scripts/create-module.js <module-name>
 */

const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Usage: node scripts/create-module.js <module-name>');
  process.exit(1);
}

const moduleDir = path.join(__dirname, '../modules', moduleName);

if (fs.existsSync(moduleDir)) {
  console.error(`❌ Module "${moduleName}" already exists!`);
  process.exit(1);
}

// Create directory structure
fs.mkdirSync(moduleDir, { recursive: true });
fs.mkdirSync(path.join(moduleDir, 'commands'), { recursive: true });
fs.mkdirSync(path.join(moduleDir, 'events'), { recursive: true });

// Create manifest.json
const manifest = {
  name: moduleName,
  description: 'Add module description here',
  version: '1.0.0',
  author: 'ForgeBot Contributors',
  permissions: [],
  enabled_by_default: true,
};

fs.writeFileSync(
  path.join(moduleDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
);

// Create README.md
const readme = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module

## Description
Add your module description here.

## Commands
- Add commands here

## Events
- Add events here

## Installation
Place this folder in the modules directory and ensure it's enabled in your bot config.
`;

fs.writeFileSync(path.join(moduleDir, 'README.md'), readme);

console.log(`✅ Module "${moduleName}" created successfully!`);
console.log(`📁 Location: ${moduleDir}`);
console.log('\n📝 Next steps:');
console.log('  1. Edit manifest.json to add permissions and description');
console.log('  2. Create commands in the commands/ directory');
console.log('  3. Create events in the events/ directory');
