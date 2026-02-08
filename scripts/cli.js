#!/usr/bin/env node

/**
 * Next.js Scaffold CLI
 * Usage: next-js-scaffold g <FEATURE_NAME>
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = process.argv[2];

if (command === 'g' || command === 'generate') {
  // Run the generate feature script with the remaining arguments
  const featureName = process.argv[3];
  if (!featureName) {
    console.error('Error: Feature name is required');
    console.log('Usage: next-js-scaffold g <FEATURE_NAME>');
    process.exit(1);
  }

  // Execute the generate-feature script
  // Use shell: false to prevent command injection
  const scriptPath = path.join(__dirname, 'generate-feature.js');
  const child = spawn('node', [scriptPath, featureName], {
    stdio: 'inherit',
    shell: false  // Security: prevent shell injection
  });

  child.on('close', (code) => {
    process.exit(code);
  });
} else {
  console.error(`Unknown command: ${command || '(none)'}`);
  console.log('Available commands:');
  console.log('  g, generate  Generate a new feature');
  console.log('Usage: next-js-scaffold g <FEATURE_NAME>');
  process.exit(1);
}
