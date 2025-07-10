// Test script to verify buildkit-ui package import

// Test CommonJS import
try {
  const { BuildKitUI } = require('../dist/plugin.cjs.js');
  console.log('✅ CommonJS import successful');
  console.log('BuildKitUI:', typeof BuildKitUI);
} catch (error) {
  console.error('❌ CommonJS import failed:', error.message);
}

// Test direct file imports
try {
  const pluginCjs = require('../dist/plugin.cjs.js');
  console.log('\n✅ Direct CJS file import successful');
  console.log('Plugin exports:', Object.keys(pluginCjs));
} catch (error) {
  console.error('\n❌ Direct CJS file import failed:', error.message);
}

// Check if styles exist
const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, '../dist/styles/buildkit-ui.css');
if (fs.existsSync(stylesPath)) {
  console.log('\n✅ Styles file exists');
  const stats = fs.statSync(stylesPath);
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
  console.error('\n❌ Styles file not found');
}

// Check ESM files
const esmIndexPath = path.join(__dirname, '../dist/esm/index.js');
if (fs.existsSync(esmIndexPath)) {
  console.log('\n✅ ESM index file exists');
} else {
  console.error('\n❌ ESM index file not found');
}

// Check TypeScript definitions
const dtsPath = path.join(__dirname, '../dist/esm/index.d.ts');
if (fs.existsSync(dtsPath)) {
  console.log('✅ TypeScript definitions exist');
} else {
  console.error('❌ TypeScript definitions not found');
}

// List all exported components
try {
  const componentsPath = path.join(__dirname, '../dist/esm/components');
  if (fs.existsSync(componentsPath)) {
    const componentDirs = fs.readdirSync(componentsPath)
      .filter(item => fs.statSync(path.join(componentsPath, item)).isDirectory());
    console.log('\n📦 Available components:');
    componentDirs.forEach(comp => console.log(`   - ${comp}`));
  }
} catch (error) {
  console.error('Could not list components:', error.message);
}

console.log('\n✅ Package structure test complete!');