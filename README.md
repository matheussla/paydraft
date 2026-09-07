# Paydraft

Local-only invoicing app with Demo USDC on Solana (npm workspaces).

## Project Structure

This is a monorepo using npm workspaces with clean architecture principles:

```
paydraft/
├── apps/
│   ├── web/              React + Vite + TypeScript + Tailwind frontend
│   │   ├── src/
│   │   │   ├── core/     App setup and routing
│   │   │   ├── features/ Feature modules (isolated, self-contained)
│   │   │   └── shared/   Reusable components, hooks, utilities
│   │   └── ...
│   └── api/              Node Express + TypeScript backend
│       ├── src/
│       │   ├── domain/        Business logic and entities
│       │   ├── application/   Use cases and services
│       │   ├── infrastructure/ External concerns (DB, server, etc.)
│       │   └── interfaces/     HTTP controllers and routes
│       └── ...
├── packages/
│   └── shared/           Shared types, schemas, and API contracts
├── scripts/              Local setup and utility scripts
└── ...
```

## Architecture Principles

### Clean Architecture

The API follows clean architecture with clear layer boundaries:

1. **Domain Layer** - Core business logic, entities, and interfaces (no dependencies)
2. **Application Layer** - Use cases and services (depends on domain only)
3. **Infrastructure Layer** - External concerns like database and server (implements domain interfaces)
4. **Interfaces Layer** - HTTP controllers and routes (depends on application)

**Dependency Rule**: Dependencies point inward. Domain has no dependencies. Outer layers depend on inner layers, never the reverse.

### Frontend Architecture

The web app uses feature-based organization:

- **Core** - App setup and configuration
- **Features** - Self-contained feature modules with components, hooks, and services
- **Shared** - Truly reusable components and utilities

### API Contracts

All API request/response types live in `packages/shared`. Both web and api import from this single source of truth.

## Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

### Development

Copy environment variables:

```bash
cp .env.example .env
```

Run the web app:

```bash
npm run dev:web
```

Run the API server:

```bash
npm run dev:api
```

### Building

Build all workspaces:

```bash
npm run build:web
npm run build:api
```

Type check all workspaces:

```bash
npm run type-check
```

## Development Guidelines

### SOLID Principles

- **Single Responsibility** - Each class/function has one reason to change
- **Open-Closed** - Open for extension, closed for modification
- **Liskov Substitution** - Subtypes must be substitutable for their base types
- **Interface Segregation** - Many specific interfaces over one general interface
- **Dependency Inversion** - Depend on abstractions, not concretions

### Module Boundaries

- `apps/web`, `apps/api`, `packages/shared` are separate packages
- No circular dependencies between packages
- Shared types/schemas only in `packages/shared`
- Features should be as isolated as possible

### Composition Over Inheritance

Prefer composition and dependency injection. Services receive dependencies through constructors.

## Architecture Notes

This project uses a local-first architecture. All data is stored locally and operations are designed for offline-first use.

Future features will include Demo USDC on Solana for invoice payments in a test environment.

## Future Roadmap

- Invoice creation and management
- Customer management
- Payment processing with Demo USDC on Solana devnet
- Local data persistence
- PDF invoice generation
