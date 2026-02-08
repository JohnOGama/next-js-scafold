#!/usr/bin/env node

/**
 * Feature Generator CLI
 * Generates a new feature folder structure with boilerplate files
 * Usage: npm run g <FEATURE_NAME> or node scripts/generate-feature.js <FEATURE_NAME>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({
  path: "./src/config/.env"
});

// Security: Prevent execution in production environments
const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'production') {
  console.error('Error: This script cannot be run in production environment');
  console.error('This is a development-only tool for generating feature scaffolding');
  process.exit(1);
}

// Security: Additional check for common production indicators
const isProduction =
  nodeEnv === 'production' ||
  process.env.VERCEL_ENV === 'production' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
  process.env.CI === 'true' && nodeEnv !== 'development';

if (isProduction) {
  console.error('Error: This script cannot be run in production or CI environments');
  console.error('This is a development-only tool for generating feature scaffolding');
  process.exit(1);
}

// Get feature name from command line arguments
const featureName = process.argv[2];

if (!featureName) {
  console.error('Error: Feature name is required');
  console.log('Usage: npm run g <FEATURE_NAME>');
  process.exit(1);
}

// Validate feature name (alphanumeric and hyphens/underscores only)
// Also prevent path traversal attempts
if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(featureName)) {
  console.error('Error: Feature name must start with a letter and contain only letters, numbers, hyphens, and underscores');
  process.exit(1);
}

// Additional security: reject any path traversal attempts
if (featureName.includes('..') || featureName.includes('/') || featureName.includes('\\')) {
  console.error('Error: Feature name cannot contain path traversal characters');
  process.exit(1);
}

// Convert feature name to camelCase for variable names
// Security: Only use validated characters, no code injection possible
const camelCaseName = featureName.charAt(0).toLowerCase() + featureName.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase());
// Convert to PascalCase for type names
const pascalCaseName = featureName.charAt(0).toUpperCase() + featureName.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase());

// Additional validation: ensure variable names are valid JavaScript identifiers
if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(camelCaseName) || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(pascalCaseName)) {
  console.error('Error: Feature name generates invalid JavaScript identifiers');
  process.exit(1);
}

// Base paths - use path.resolve to get absolute path and prevent traversal
const featuresDir = path.resolve(__dirname, '..', 'src', 'features');
const featureDir = path.resolve(featuresDir, featureName);

// Security check: ensure the feature directory is within the features directory
// This prevents path traversal attacks
if (!featureDir.startsWith(featuresDir + path.sep) && featureDir !== featuresDir) {
  console.error('Error: Invalid feature name - path traversal detected');
  process.exit(1);
}

// Check if feature already exists
if (fs.existsSync(featureDir)) {
  console.error(`Error: Feature "${featureName}" already exists`);
  process.exit(1);
}

// Create directories
const componentsDir = path.join(featureDir, 'components');
const hooksDir = path.join(featureDir, 'hooks');

fs.mkdirSync(featureDir, { recursive: true });
fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(hooksDir, { recursive: true });

// Generate .api.ts file
const apiContent = `// ${pascalCaseName} API endpoints
import { api } from "@/shared/libs/api.service";
import { ${pascalCaseName}Payload } from "./${featureName}.type";

export const ${camelCaseName}Api = {
  // Add your API methods here
};
`;

// Generate .service.ts file
const serviceContent = `// ${pascalCaseName} service layer
import { ${pascalCaseName}Payload } from "./${featureName}.type";
import * as api from "./${featureName}.api";
import { ${camelCaseName}Schema } from "./${featureName}.validation";

export const ${camelCaseName}Service = {
  async example(payload: ${pascalCaseName}Payload) {
    ${camelCaseName}Schema.parse(payload);
    return api.${camelCaseName}Api.example(payload);
  },
};
`;

// Generate .type.ts file
const typeContent = `// ${pascalCaseName} TypeScript types and interfaces
export interface ${pascalCaseName}Payload {
  // Define your payload types
}
`;

// Generate .validation.ts file
const validationContent = `// ${pascalCaseName} Zod validation schemas
import z from "zod";

export const ${camelCaseName}Schema = z.object({
  // Define your validation schema
});

export type ${pascalCaseName}SchemaT = z.infer<typeof ${camelCaseName}Schema>;
`;

// Generate .store.ts file
const storeContent = `// ${pascalCaseName} store logic
// Add your store implementation here (e.g., Zustand, Redux, etc.)
`;

// Write files - validate file paths to prevent directory traversal
const writeFile = (filename, content) => {
  const filePath = path.join(featureDir, filename);
  // Security: ensure file is within feature directory
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(featureDir + path.sep) && resolvedPath !== featureDir) {
    throw new Error(`Security: Invalid file path - ${filename}`);
  }
  fs.writeFileSync(resolvedPath, content, 'utf8');
};

writeFile(`${featureName}.api.ts`, apiContent);
writeFile(`${featureName}.service.ts`, serviceContent);
writeFile(`${featureName}.type.ts`, typeContent);
writeFile(`${featureName}.validation.ts`, validationContent);
writeFile(`${featureName}.store.ts`, storeContent);

console.log(`✅ Feature "${featureName}" generated successfully!`);
console.log(`📁 Location: src/features/${featureName}/`);
console.log(`\nGenerated files:`);
console.log(`  - ${featureName}.api.ts`);
console.log(`  - ${featureName}.service.ts`);
console.log(`  - ${featureName}.type.ts`);
console.log(`  - ${featureName}.validation.ts`);
console.log(`  - ${featureName}.store.ts`);
console.log(`\nGenerated folders:`);
console.log(`  - components/`);
console.log(`  - hooks/`);
