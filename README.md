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
- ⚙️ **Feature Generator**: Built-in CLI to generate feature modules with boilerplate code

## Installation

Since this tool is not yet published on npm, you need to clone and set it up locally:

```bash
# Clone the repository
git clone https://github.com/JohnOGama/next-js-scaffold
cd next-js-scaffold

# Install dependencies
npm install

# Build the project
npm run build

# Link globally to make the CLI available
npm link
```

After linking, the `next-js-scaffold` command will be available globally on your system.

## Quick Start

1. **Install the CLI tool** (see Installation above)

2. **Create a new Next.js project**:
   ```bash
   next-js-scaffold
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

6. **Generate new features**:
   ```bash
   npm run g <FEATURE_NAME>
   # Example: npm run g user
   ```

## Usage

### Basic Usage

```bash
next-js-scaffold my-nextjs-app
```

This will start an interactive prompt where you can:
- Choose your package manager (npm, pnpm, yarn, or bun)
- Confirm project creation

### With Package Manager

```bash
next-js-scaffold my-nextjs-app --package-manager pnpm
# or
next-js-scaffold my-nextjs-app -p yarn
# or
next-js-scaffold my-nextjs-app -p bun
```

### Skip Prompts

```bash
next-js-scaffold my-nextjs-app --yes
# or
next-js-scaffold my-nextjs-app -y
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
├── scripts/             # CLI scripts
│   └── generate-feature.js  # Feature generator CLI
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

### Feature Generator

Every generated project includes a built-in CLI tool to generate new feature modules:

```bash
npm run g <FEATURE_NAME>
```

This command generates a complete feature structure with:
- `{feature}.api.ts` - API endpoints
- `{feature}.service.ts` - Service layer
- `{feature}.type.ts` - TypeScript types
- `{feature}.validation.ts` - Zod validation schemas
- `{feature}.store.ts` - Store logic
- `components/` - Component folder
- `hooks/` - Custom hooks folder

**Example:**
```bash
npm run g user
```

This creates `src/features/user/` with all the boilerplate files ready to use.

## Getting Started with Generated Project

After generating a project:

```bash
cd my-nextjs-app
npm install  # or pnpm install, yarn install, bun install
npm run dev  # or pnpm dev, yarn dev, bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### Generating New Features

Once your project is set up, you can generate new feature modules using the built-in CLI:

```bash
npm run g <FEATURE_NAME>
```

**Example:**
```bash
npm run g product
npm run g order
npm run g payment
```

Each feature will be generated with a complete structure including API, service, types, validation, store, components, and hooks folders.

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
Usage: next-js-scaffold [project-name] [options]

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
