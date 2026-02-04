#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './createProject.js';
import { PackageManager } from './utils/packageManager.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

const program = new Command();

// Simple welcome message
function showWelcome() {
  console.log(chalk.cyan.bold('\n🚀 Next.js Scaffold Generator\n'));
}

program
  .name('next-js-scafold')
  .description('Generate a Next.js project with structured architecture')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project to create')
  .option('-p, --package-manager <manager>', 'Package manager to use (npm, pnpm, yarn, bun)')
  .option('-y, --yes', 'Skip all prompts and use defaults')
  .action(async (projectName: string, options: { packageManager?: string; yes?: boolean }) => {
    try {
      showWelcome();

      let packageManager: PackageManager;
      let finalProjectName: string;

      // If --yes flag, use defaults
      if (options.yes) {
        packageManager = options.packageManager as PackageManager || 'npm';
        finalProjectName = projectName || 'my-nextjs-app';
      } else {
        // Interactive mode: Package manager selection first
        if (!options.packageManager) {
          const pmAnswer = await inquirer.prompt([
            {
              type: 'list',
              name: 'packageManager',
              message: '📦 Which package manager would you like to use?',
              choices: [
                { name: 'npm   (Node Package Manager)', value: 'npm' },
                { name: 'pnpm  (Fast, disk space efficient)', value: 'pnpm' },
                { name: 'yarn  (Fast, reliable, secure)', value: 'yarn' },
                { name: 'bun   (All-in-one JavaScript runtime)', value: 'bun' },
              ],
              default: 0,
            },
          ]);
          packageManager = pmAnswer.packageManager;
        } else {
          packageManager = options.packageManager as PackageManager;
        }

        // Project name prompt
        if (!projectName) {
          const nameAnswer = await inquirer.prompt([
            {
              type: 'input',
              name: 'projectName',
              message: '📝 What is your project name?',
              default: 'my-nextjs-app',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Project name cannot be empty';
                }
                if (!/^[a-z0-9-]+$/i.test(input.trim())) {
                  return 'Project name can only contain letters, numbers, and hyphens';
                }
                return true;
              },
            },
          ]);
          finalProjectName = nameAnswer.projectName.trim();
        } else {
          finalProjectName = projectName;
        }
      }

      await createProject({
        projectName: finalProjectName,
        packageManager,
        skipPrompts: options.yes || false,
        autoInstall: !options.yes, // Auto-install unless --yes flag
      });
    } catch (error) {
      console.error(chalk.red('\n❌ Error creating project:'), error);
      process.exit(1);
    }
  });

program.parse();
