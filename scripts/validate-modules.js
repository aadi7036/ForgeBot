/**
 * Module Validation Script
 * Validates all modules for required structure and metadata
 */

const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../modules');
const modules = fs.readdirSync(modulesDir).filter(file => {
  return fs.statSync(path.join(modulesDir, file)).isDirectory();
});

let errors = 0;
let warnings = 0;

console.log('🔍 Validating modules...\n');

modules.forEach(moduleName => {
  const moduleDir = path.join(modulesDir, moduleName);
  const manifestPath = path.join(moduleDir, 'manifest.json');

  // Check manifest exists
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ ${moduleName}: Missing manifest.json`);
    errors++;
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Validate manifest fields
    if (!manifest.name) {
      console.warn(`⚠️  ${moduleName}: Missing 'name' field in manifest`);
      warnings++;
    }
    if (!manifest.description) {
      console.warn(`⚠️  ${moduleName}: Missing 'description' field in manifest`);
      warnings++;
    }
    if (!Array.isArray(manifest.permissions)) {
      console.warn(`⚠️  ${moduleName}: 'permissions' should be an array`);
      warnings++;
    }

    console.log(`✅ ${moduleName}: Valid`);
  } catch (error) {
    console.error(`❌ ${moduleName}: Invalid JSON in manifest.json`);
    errors++;
  }
});

console.log(`\n📊 Summary: ${modules.length} modules checked, ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  process.exit(1);
}
