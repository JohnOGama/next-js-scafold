#!/usr/bin/env node

/**
 * Simple test script to verify the scaffold works
 * Run: node test-local.js
 */

import { execSync } from 'child_process';
import { existsSync, removeSync } from 'fs-extra';
import { join } from 'path';

const TEST_PROJECT_NAME = 'test-scafold-output';

console.log('🧪 Testing Scafold Package\n');
console.log('==========================\n');

try {
  // Step 1: Build
  console.log('📦 Step 1: Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Build successful!\n');

  // Step 2: Check if test project exists and remove it
  const testPath = join(process.cwd(), '..', TEST_PROJECT_NAME);
  if (existsSync(testPath)) {
    console.log('🗑️  Removing existing test project...');
    removeSync(testPath);
  }

  // Step 3: Run the CLI
  console.log('🚀 Step 2: Running scafold CLI...');
  const cliPath = join(process.cwd(), 'bin', 'cli.js');
  execSync(`node "${cliPath}" ${TEST_PROJECT_NAME} --yes`, {
    stdio: 'inherit',
    cwd: join(process.cwd(), '..'),
  });

  // Step 4: Verify
  console.log('\n🔍 Step 3: Verifying generated project...');
  const projectPath = join(process.cwd(), '..', TEST_PROJECT_NAME);

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/features/auth/auth.api.ts',
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = join(projectPath, file);
    if (existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MISSING!`);
      allFilesExist = false;
    }
  }

  if (allFilesExist) {
    console.log('\n🎉 All tests passed! The scaffold is working correctly.\n');
    console.log('To clean up, run:');
    console.log(`  rm -rf ${TEST_PROJECT_NAME}  # Linux/Mac`);
    console.log(`  rmdir /s ${TEST_PROJECT_NAME}  # Windows`);
  } else {
    console.log('\n❌ Some files are missing. Please check the errors above.');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
