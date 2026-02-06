import fs from 'fs-extra';
const { copySync, ensureDirSync, writeFileSync, readFileSync, existsSync } = fs;
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PackageManager } from './packageManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TemplateVariables {
  projectName: string;
  packageManager: PackageManager;
}

export async function copyTemplates(
  templatesPath: string,
  targetPath: string,
  variables: TemplateVariables
) {
  // Ensure target directory exists
  ensureDirSync(targetPath);

  // Copy all template files
  if (existsSync(templatesPath)) {
    copySync(templatesPath, targetPath, {
      overwrite: true,
      filter: (src) => {
        // Skip node_modules and other unnecessary files
        return !src.includes('node_modules') &&
               !src.includes('.git') &&
               !src.includes('dist');
      },
    });
  } else {
    // If templates don't exist, create the structure programmatically
    await createProjectStructure(targetPath, variables);
  }
}

export async function generateFiles(
  projectPath: string,
  variables: TemplateVariables
) {
  // Replace template variables in package.json
  const packageJsonPath = join(projectPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    let content = readFileSync(packageJsonPath, 'utf-8');
    content = content.replace(/\{\{projectName\}\}/g, variables.projectName);
    writeFileSync(packageJsonPath, content, 'utf-8');
  }

  // Update README.md
  const readmePath = join(projectPath, 'README.md');
  if (existsSync(readmePath)) {
    let content = readFileSync(readmePath, 'utf-8');
    content = content.replace(/\{\{projectName\}\}/g, variables.projectName);
    content = content.replace(/\{\{packageManager\}\}/g, variables.packageManager);
    writeFileSync(readmePath, content, 'utf-8');
  }
}

async function createProjectStructure(
  targetPath: string,
  variables: TemplateVariables
) {
  // This function creates the project structure programmatically
  // if templates directory doesn't exist
  const structure = getProjectStructure(variables);

  // Create empty directories that don't have files
  // Add .gitkeep files so empty directories are tracked by git
  const emptyDirs = [
    'src/shared/constants',
    'src/shared/types',
    'src/shared/components/shadcnUi',
    'src/stores',
    'src/tests/e2e',
    'src/tests/unit',
  ];

  for (const dir of emptyDirs) {
    const dirPath = join(targetPath, dir);
    ensureDirSync(dirPath);
    // Add .gitkeep to preserve empty directories
    writeFileSync(join(dirPath, '.gitkeep'), '', 'utf-8');
  }

  // Create public directory (no .gitkeep needed as it will have assets)
  ensureDirSync(join(targetPath, 'public'));

  // Create all files
  for (const file of structure) {
    const filePath = join(targetPath, file.path);
    ensureDirSync(dirname(filePath));
    writeFileSync(filePath, file.content, 'utf-8');
  }
}

function getProjectStructure(variables: TemplateVariables) {
  const { projectName, packageManager } = variables;
  const installCmd = packageManager === 'npm' ? 'npm install' :
                     packageManager === 'pnpm' ? 'pnpm install' :
                     packageManager === 'yarn' ? 'yarn install' : 'bun install';
  const devCmd = packageManager === 'npm' ? 'npm run dev' :
                 packageManager === 'pnpm' ? 'pnpm dev' :
                 packageManager === 'yarn' ? 'yarn dev' : 'bun run dev';

  return [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'eslint'
        },
        dependencies: {
          '@hookform/resolvers': '^5.2.2',
          '@tanstack/react-query': '^5.90.20',
          'class-variance-authority': '^0.7.1',
          'clsx': '^2.1.1',
          'lucide-react': '^0.563.0',
          'next': '16.1.6',
          'radix-ui': '^1.4.3',
          'react': '19.2.3',
          'react-dom': '19.2.3',
          'react-hook-form': '^7.71.1',
          'tailwind-merge': '^3.4.0',
          'zod': '^4.3.6'
        },
        devDependencies: {
          '@tailwindcss/postcss': '^4',
          '@types/node': '^20',
          '@types/react': '^19',
          '@types/react-dom': '^19',
          'eslint': '^9',
          'eslint-config-next': '16.1.6',
          'tailwindcss': '^4',
          'tw-animate-css': '^1.4.0',
          'typescript': '^5'
        }
      }, null, 2)
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2017',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'react-jsx',
          incremental: true,
          plugins: [
            {
              name: 'next'
            }
          ],
          paths: {
            '@/*': ['./src/*']
          }
        },
        include: [
          'next-env.d.ts',
          '**/*.ts',
          '**/*.tsx',
          '.next/types/**/*.ts',
          '.next/dev/types/**/*.ts',
          '**/*.mts'
        ],
        exclude: ['node_modules']
      }, null, 2)
    },
    {
      path: 'next.config.ts',
      content: `import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // Proxy API requests to backend (same-origin for cookies)
      {
        source: "/api/v1/:path*",
        destination: \`\${BACKEND_URL}/api/v1/:path*\`,
      },
      // Proxy auth requests to backend
      {
        source: "/api/auth/:path*",
        destination: \`\${BACKEND_URL}/api/auth/:path*\`,
      },
    ]
  }
};

export default nextConfig;
`
    },
    {
      path: 'eslint.config.mjs',
      content: `import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
`
    },
    {
      path: 'postcss.config.mjs',
      content: `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`
    },
    {
      path: 'README.md',
      content: `# ${projectName}

This is a [Next.js](https://nextjs.org) project bootstrapped with [scaffold](https://github.com/your-repo/scaffold).

## Getting Started

First, install dependencies:

\`\`\`bash
${installCmd}
\`\`\`

Then, run the development server:

\`\`\`bash
${devCmd}
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

\`\`\`
src/
  app/              # Next.js app directory
  config/           # Configuration files
  features/         # Feature-based modules
  shared/           # Shared utilities and components
  stores/           # State management
  styles/           # Global styles
  tests/            # Test files
\`\`\`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
`
    },
    {
      path: 'src/app/layout.tsx',
      content: `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import AppProviders from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
`
    },
    {
      path: 'src/app/providers.tsx',
      content: `'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
`
    },
    {
      path: 'src/app/page.tsx',
      content: `import Image from "next/image";
import Link from "next/link";
import CodeBlock from "@/shared/components/CodeBlock";

// Links and Constants
const LINKS = {
  npm: "https://www.npmjs.com/package/scaffold",
  github: "https://github.com/JohnOGama/next-js-scaffold",
  linkedin: "https://www.linkedin.com/in/johnogama/",
  facebook: "https://www.facebook.com/CreatorVayne/",
  quickStartGuide: "https://github.com/JohnOGama/next-js-scaffold/blob/main/README.md",
} as const;

const AUTHOR = {
  name: "John Ogama",
} as const;

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 font-sans dark:from-black dark:via-zinc-950 dark:to-zinc-900 overflow-hidden">
      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: \`radial-gradient(circle, rgb(113 113 122) 1px, transparent 1px)\`,
          backgroundSize: '24px 24px',
        }}
      ></div>

      {/* Dark Shadow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/5 to-zinc-900/10 dark:from-transparent dark:via-zinc-950/20 dark:to-zinc-950/30 pointer-events-none"></div>

      {/* Content */}
      <main className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
            <div className="relative">
              <Image
                className="dark:invert mx-auto drop-shadow-lg"
                src="/next.svg"
                alt="Next.js logo"
                width={120}
                height={24}
                priority
              />
            </div>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-4 py-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            CLI Tool for Next.js
          </div>
          <h1 className="mb-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-50 dark:via-zinc-100 dark:to-zinc-50 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            Scafold
          </h1>
          <p className="mb-4 max-w-2xl text-xl leading-8 text-zinc-700 dark:text-zinc-300 sm:text-2xl font-medium">
            A powerful CLI tool to scaffold Next.js projects with a structured, feature-based architecture
          </p>
          <p className="mb-12 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Clone, build, and link to start scaffolding Next.js projects locally
          </p>

          {/* Installation Code Block */}
          <div className="w-full max-w-2xl mb-12">
            <div className="group relative rounded-xl bg-zinc-900 dark:bg-zinc-950 p-3 border border-zinc-800 shadow-2xl hover:shadow-zinc-900/50 dark:hover:shadow-zinc-950/50 transition-all duration-300">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                    </div>
                    <span className="text-sm text-zinc-400 ml-2 font-medium">Terminal</span>
                  </div>
                  <span className="text-xs text-zinc-500 px-2 py-1 rounded bg-zinc-800/50">Installation</span>
                </div>
                <div className="space-y-2">
                  <CodeBlock command={\`git clone \${LINKS.github}.git\`} />
                  <CodeBlock command="cd next-js-scaffold" />
                  <CodeBlock command="npm install" />
                  <CodeBlock command="npm run build" />
                  <CodeBlock command="npm link" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="w-full max-w-2xl mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
                Quick Start
              </h2>
              <Link
                href={LINKS.quickStartGuide}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
              >
                View Full Guide
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="group relative rounded-xl bg-zinc-900 dark:bg-zinc-950 p-6 border border-zinc-800 shadow-2xl hover:shadow-zinc-900/50 dark:hover:shadow-zinc-950/50 transition-all duration-300">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
              <div className="relative space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Interactive Mode</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Recommended</span>
                  </div>
                  <CodeBlock command="next-js-scaffold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                Quick Setup
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Generate a complete Next.js project in seconds with all the tools you need
              </p>
            </div>
          </div>

          <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">📦</div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                Package Manager Support
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Works seamlessly with npm, pnpm, yarn, and bun
              </p>
            </div>
          </div>

          <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">🏗️</div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                Structured Architecture
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Feature-based folder structure for scalable applications
              </p>
            </div>
          </div>

          <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-500/0 to-amber-500/0 group-hover:from-yellow-500/5 group-hover:to-amber-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                TypeScript Ready
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Full TypeScript support out of the box with proper type definitions
              </p>
            </div>
          </div>

          <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/5 group-hover:to-rose-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                Tailwind CSS v4
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pre-configured with the latest Tailwind CSS for modern styling
              </p>
            </div>
          </div>

          <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-6 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 to-violet-500/0 group-hover:from-indigo-500/5 group-hover:to-violet-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">🔧</div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                Pre-configured
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                ESLint, TypeScript, and other tools ready to use immediately
              </p>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-8 mb-16 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="relative">
            <h2 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
              What&apos;s Included
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                  Core Dependencies
                </h3>
                <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>Next.js 16.1.6</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>React 19.2.3</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>TypeScript 5</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>Tailwind CSS 4</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-purple-500"></span>
                  Additional Tools
                </h3>
                <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>React Hook Form</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>Zod Validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>TanStack Query</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>Example Auth Feature</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-4 py-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <span>✨</span>
            <span>Ready to build something amazing?</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-black dark:text-zinc-50">
            Ready to get started?
          </h2>
          <p className="mb-10 max-w-xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Clone, build, and link to start scaffolding Next.js projects locally
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              className="group flex h-12 items-center justify-center gap-2 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-8 font-medium transition-all duration-300 hover:scale-105 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-lg"
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-black dark:text-zinc-50">View on GitHub</span>
            </Link>
          </div>
        </div>

        {/* Author Section */}
        <div className="text-center py-12 border-t border-zinc-200 dark:border-zinc-800">
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Created with <span className="text-red-500">♥</span> by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {AUTHOR.name}
            </span>
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </Link>
            <Link
              href={LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
`
    },
    {
      path: 'src/styles/globals.css',
      content: `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`
    },
    {
      path: 'src/config/routes.ts',
      content: `// Route configuration
export const routes = {
  home: '/',
  // Add your routes here
};
`
    },
    {
      path: 'src/config/.env.example',
      content: `# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Cookie header name for authentication
NEXT_PUBLIC_COOKIES_HEADER=my-token-header
`
    },
    {
      path: 'src/proxy.ts',
      content: `import { NextRequest, NextResponse } from "next/server";
import { checkTokenExpiration } from "./shared/utils/checkTokenExpiration";

const publicRoutes = ["/login", "/register", "/forgot-password", "/processing"];
const cookieHeader = process.env.NEXT_PUBLIC_COOKIES_HEADER || "my-token-header"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionData = request.cookies.get(cookieHeader);
  const isTokenExpired = checkTokenExpiration(sessionData?.value || "");
  const hasValidSession = sessionData?.value && !isTokenExpired;

  // If user has valid session and tries to access public routes, redirect to home
  if (publicRoutes.includes(pathname)) {
    if (hasValidSession) {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Protected routes - require valid session
  if (!hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
`
    },
    {
      path: 'src/shared/components/CodeBlock.tsx',
      content: `'use client'

import { useState } from 'react'

interface CodeBlockProps {
  command: string
  className?: string
}

export default function CodeBlock({ command, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      className={\`group relative flex items-center \${className}\`}
    >
      <code
        className="relative flex items-center w-full justify-between text-sm text-nowrap transition-colors cursor-pointer"
        onClick={handleCopy}
      >
        <div className="text-zinc-500">$ <span className='text-zinc-100 font-mono hover:text-white'>{command}</span></div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700/90 backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-medium shadow-lg hover:shadow-xl hover:scale-105 z-10"
          onClick={handleCopy}
          aria-label="Copy command"
          title="Click to copy"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </code>
    </div>
  )
}
`
    },
    {
      path: 'src/shared/libs/utils.ts',
      content: `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
    },
    {
      path: 'src/shared/libs/api.service.ts',
      content: `interface ApiResponse<T> {
  response: number;
  success: string;
  error: string | null;
  data: T;
}
const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};
async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}
async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: defaultHeaders,
    credentials: "include",
    ...options,
  });
  if (!res.ok && res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }
  if (!res.ok) {
    const errorData = await parseResponse<T>(res);
    throw errorData;
  }
  return parseResponse<T>(res);
}
export const api = {
  get: <T>(url: string) => request<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
`
    },
    {
      path: 'src/shared/hooks/useFormWithZod.ts',
      content: `import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function useFormWithZod<T extends FieldValues>(
  schema: z.ZodSchema<T>
) {
  return useForm<T>({
    // @ts-expect-error - zodResolver type incompatibility with Zod v4
    resolver: zodResolver(schema),
  });
}
`
    },
    {
      path: 'src/shared/utils/checkTokenExpiration.ts',
      content: `export const checkTokenExpiration = (token: string) => {
  if (!token) return false;
  // Your logic to check token expiration
  return true
};
`
    },
    {
      path: 'src/features/auth/auth.type.ts',
      content: `export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}
`
    },
    {
      path: 'src/features/auth/auth.api.ts',
      content: `import { api } from "@/shared/libs/api.service";
import { LoginPayload, SignupPayload } from "./auth.type";

export const authApi = {
  login: (body: LoginPayload) => api.post("/login", body),
  signup: (body: SignupPayload) => api.post("/signup", body),
};
`
    },
    {
      path: 'src/features/auth/auth.service.ts',
      content: `import { LoginPayload, SignupPayload } from "./auth.type";
import * as api from "./auth.api";
import { loginSchema, signupSchema } from "./auth.validation";

export const authSevice = {
  async login(payload: LoginPayload) {
    loginSchema.parse(payload);
    return api.authApi.login(payload);
  },

  async signup(payload: SignupPayload) {
    signupSchema.parse(payload);
    return api.authApi.signup(payload);
  },
};
`
    },
    {
      path: 'src/features/auth/auth.validation.ts',
      content: `import { z } from "zod";

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5).max(30),
});

export type LoginSchemaT = z.infer<typeof loginSchema>;

// Signup
export const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(5).max(30),
});

export type SignupSchemaT = z.infer<typeof signupSchema>;
`
    },
    {
      path: 'src/features/auth/auth.store.ts',
      content: `// Auth store - add your state management logic here
`
    },
    {
      path: 'src/features/auth/hooks/useAuth.ts',
      content: `import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authSevice } from "../auth.service";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authSevice.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    }
  })

  const signupMutation = useMutation({
    mutationFn: authSevice.signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    }
  })

  return {
    loginMutation,
    signupMutation,
  }
};
`
    },
    {
      path: 'src/features/auth/components/LoginForm.tsx',
      content: `// LoginForm component - add your login form implementation here
export default function LoginForm() {
  return (
    <div>
      {/* Add your login form here */}
    </div>
  );
}
`
    },
    {
      path: '.gitignore',
      content: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for committing if needed)
.env
.env.development.local
.env.test.local
.env.production.local
.env.local
.env.development
.env.test
.env.production

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
    },
    {
      path: 'next-env.d.ts',
      content: `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`
    }
  ];
}
