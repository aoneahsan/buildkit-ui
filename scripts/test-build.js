#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('\n🔨 Testing BuildKit UI build...\n'));

try {
  // Clean previous build
  console.log('Cleaning previous build...');
  execSync('npm run clean', { stdio: 'inherit' });

  // Run TypeScript compilation
  console.log('\nCompiling TypeScript...');
  execSync('npm run tsc', { stdio: 'inherit' });

  // Run Rollup build
  console.log('\nBundling with Rollup...');
  execSync('rollup -c rollup.config.js', { stdio: 'inherit' });

  // Check if dist files exist
  const distPath = path.join(__dirname, '..', 'dist');
  const requiredFiles = [
    'plugin.js',
    'plugin.cjs.js',
    'esm/index.js',
    'esm/index.d.ts'
  ];

  console.log('\nVerifying build output...');
  let allFilesExist = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(chalk.green(`✓ ${file}`));
    } else {
      console.log(chalk.red(`✗ ${file}`));
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    console.log(chalk.green('\n✅ Build completed successfully!\n'));
  } else {
    console.log(chalk.red('\n❌ Build failed - missing files\n'));
    process.exit(1);
  }

} catch (error) {
  console.error(chalk.red('\n❌ Build failed:\n'));
  console.error(error);
  process.exit(1);
}