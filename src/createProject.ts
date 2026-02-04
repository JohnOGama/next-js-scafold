import fs from 'fs-extra';
const { existsSync, removeSync } = fs;
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync } from 'child_process';
import { copyTemplates, generateFiles } from './utils/fileGenerator.js';
import { PackageManager, getInstallCommand, getRunCommand } from './utils/packageManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CreateProjectOptions {
  projectName: string;
  packageManager: PackageManager;
  skipPrompts?: boolean;
  autoInstall?: boolean;
}

export async function createProject(options: CreateProjectOptions) {
  const { projectName, packageManager, skipPrompts = false, autoInstall = false } = options;

  const projectPath = join(process.cwd(), projectName);

  // Check if directory exists
  if (existsSync(projectPath)) {
    if (!skipPrompts) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `⚠️  Directory ${projectName} already exists. Overwrite?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log('\n❌ Cancelled.\n');
        return;
      }
    }

    // Remove existing directory
    const removeSpinner = ora('🗑️  Removing existing directory...').start();
    removeSync(projectPath);
    removeSpinner.succeed('Directory removed');
  }

  const templatesPath = join(__dirname, '../templates');

  try {
    // Copy template files
    const structureSpinner = ora('📁 Creating project structure...').start();
    await copyTemplates(templatesPath, projectPath, {
      projectName,
      packageManager,
    });
    structureSpinner.succeed('Project structure created');

    // Generate files with template replacements
    const filesSpinner = ora('📝 Generating files...').start();
    await generateFiles(projectPath, {
      projectName,
      packageManager,
    });
    filesSpinner.succeed('Files generated');

    console.log(chalk.green('\n✅ Project created successfully!\n'));

    // Auto-install dependencies
    if (autoInstall) {
      const installSpinner = ora(`📦 Installing dependencies with ${packageManager}...`).start();
      try {
        const installCmd = getInstallCommand(packageManager);
        execSync(installCmd, {
          cwd: projectPath,
          stdio: 'pipe',
        });
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Dependencies installation failed (you can install manually)');
        console.log(`  Run: ${getInstallCommand(packageManager)}`);
      }
    }

    // Simple success message
    console.log(chalk.green('🎉 Ready to start coding!\n'));

    console.log('Next steps:');
    console.log(`  cd ${projectName}`);
    if (!autoInstall) {
      console.log(`  ${getInstallCommand(packageManager)}`);
    }
    console.log(`  ${getRunCommand(packageManager, 'dev')}\n`);
  } catch (error) {
    console.error(chalk.red('\n❌ Error creating project:'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (error.stack) {
        console.error(chalk.gray(error.stack));
      }
    } else {
      console.error(chalk.red(String(error)));
    }
    throw error;
  }
}
