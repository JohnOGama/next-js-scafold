import { execSync } from 'child_process';
import fs from 'fs-extra';
const { existsSync } = fs;

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export async function detectPackageManager(): Promise<PackageManager> {
  // Check for lock files in order of preference
  if (existsSync('bun.lockb')) return 'bun';
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('package-lock.json')) return 'npm';

  // Check if package managers are installed
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return 'bun';
  } catch {
    // bun not available
  }

  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {
    // pnpm not available
  }

  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {
    // yarn not available
  }

  // Default to npm
  return 'npm';
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install';
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn install';
    case 'bun':
      return 'bun install';
  }
}

export function getRunCommand(packageManager: PackageManager, script: string): string {
  switch (packageManager) {
    case 'npm':
      return `npm run ${script}`;
    case 'pnpm':
      return `pnpm ${script}`;
    case 'yarn':
      return `yarn ${script}`;
    case 'bun':
      return `bun run ${script}`;
  }
}
