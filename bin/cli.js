#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '../dist/index.js');

// Convert to file:// URL for ESM import (required on Windows)
const distUrl = pathToFileURL(distPath).href;

// Import and run the CLI
import(distUrl).catch((error) => {
  console.error('Error loading CLI:', error);
  console.error('Make sure to build the project first: npm run build');
  process.exit(1);
});
