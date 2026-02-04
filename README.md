# Scaffold

A powerful CLI tool to scaffold Next.js projects with a structured, feature-based architecture. Generate production-ready Next.js applications with TypeScript, Tailwind CSS, and a well-organized folder structure.

## Features

- 🚀 **Quick Setup**: Generate a complete Next.js project in seconds
- 📦 **Package Manager Support**: Works with npm, pnpm, yarn, and bun
- 🏗️ **Structured Architecture**: Feature-based folder structure for scalable applications
- ⚡ **TypeScript**: Full TypeScript support out of the box
- 🎨 **Tailwind CSS**: Pre-configured with Tailwind CSS v4
- 🔧 **Pre-configured**: ESLint, TypeScript, and other tools ready to use
- 📁 **Feature Modules**: Includes example auth feature with API, services, hooks, and components

## Installation

Since this tool is not yet published on npm, you need to clone and set it up locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/scafold-repo.git](https://github.com/JohnOGama/next-js-scafold
cd scafold-repo

# Install dependencies
npm install

# Build the project
npm run build

# Link globally to make the CLI available
npm link
```

After linking, the `next-js-scafold` command will be available globally on your system.

## Quick Start

1. **Install the CLI tool** (see Installation above)

2. **Create a new Next.js project**:
   ```bash
   next-js-scafold
   ```

3. **Navigate to your project and install dependencies**:
   ```bash
   cd my-nextjs-app
   ```

4. **Start the development server**:
   ```bash
   npm run dev  # or pnpm dev, yarn dev, bun run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to see your app.

## Usage

### Basic Usage

```bash
next-js-scafold my-nextjs-app
```

This will start an interactive prompt where you can:
- Choose your package manager (npm, pnpm, yarn, or bun)
- Confirm project creation

### With Package Manager

```bash
next-js-scafold my-nextjs-app --package-manager pnpm
# or
next-js-scafold my-nextjs-app -p yarn
# or
next-js-scafold my-nextjs-app -p bun
```

### Skip Prompts

```bash
next-js-scafold my-nextjs-app --yes
# or
next-js-scafold my-nextjs-app -y
```

This will skip all confirmation prompts and use default settings.

### Auto-detect Package Manager

If you don't specify a package manager, the tool will automatically detect which one to use based on:
1. Lock files in the current directory
2. Installed package managers on your system

## Generated Project Structure

```
my-nextjs-app/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── config/           # Configuration files
│   │   └── routes.ts
│   ├── features/         # Feature-based modules
│   │   └── auth/
│   │       ├── auth.api.ts
│   │       ├── auth.service.ts
│   │       ├── auth.store.ts
│   │       ├── auth.type.ts
│   │       ├── auth.validation.ts
│   │       ├── components/
│   │       │   └── LoginForm.tsx
│   │       └── hooks/
│   │           └── useAuth.ts
│   ├── shared/           # Shared utilities and components
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   └── useFormWithZod.ts
│   │   ├── libs/
│   │   │   └── api.service.ts
│   │   ├── types/
│   │   └── ui/
│   ├── stores/           # State management
│   ├── styles/           # Global styles
│   └── tests/            # Test files
│       ├── e2e/
│       └── unit/
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md
```

## What's Included

### Dependencies

- **Next.js 16.1.6** - React framework
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **TanStack Query** - Data fetching
- **@hookform/resolvers** - Form validation integration

### Dev Dependencies

- **ESLint** - Code linting
- **eslint-config-next** - Next.js ESLint config
- **TypeScript types** - Type definitions

### Example Features

The scaffold includes a complete auth feature example with:
- API layer (`auth.api.ts`)
- Service layer (`auth.service.ts`)
- Type definitions (`auth.type.ts`)
- Validation schemas (`auth.validation.ts`)
- React hooks (`useAuth.ts`)
- Components (`LoginForm.tsx`)

## Getting Started with Generated Project

After generating a project:

```bash
cd my-nextjs-app
npm install  # or pnpm install, yarn install, bun install
npm run dev  # or pnpm dev, yarn dev, bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Development

### Building the Package

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## CLI Options

```
Usage: next-js-scafold [project-name] [options]

Options:
  -p, --package-manager <manager>  Package manager to use (npm, pnpm, yarn, bun) (default: "auto")
  -y, --yes                        Skip confirmation prompts
  -h, --help                       Display help for command
  -V, --version                    Display version number
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
