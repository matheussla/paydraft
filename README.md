# Paydraft

Local-only invoicing application with Demo USDC on a local Solana validator for payment verification. Built with pnpm workspaces.

**⚠️ Local Demo Only**: Runs entirely on your machine with a local Solana validator. Demo USDC tokens are mock SPL tokens with **no monetary value**.

## Objective

Create and manage invoices locally, then accept payments in Demo USDC (mock SPL token) on a local Solana validator. The workflow:

1. **Create Invoice** - Generate invoice with customer details and line items
2. **Pay** - Backend demo-signs transaction with local keypairs to simulate payment
3. **Verify** - Detect and verify payment on local Solana validator
4. **Receipt** - Generate receipt and mark invoice as paid

**Important**: This is a **local demo environment only**. Demo USDC tokens are mock SPL tokens with **no monetary value**. All operations run on a local Solana validator on your machine, not on devnet or mainnet.

## Current Status

**Skeleton only** - Clean architecture monorepo scaffold is in place. Business logic (invoices, payments, Solana integration, MongoDB) will be added in future iterations.

### What's Built Today

- ✅ Monorepo structure with pnpm workspaces
- ✅ React + Vite + TypeScript + Tailwind frontend (stub)
- ✅ Express + TypeScript API with clean architecture layers (stubs)
- ✅ Shared types package
- ✅ TypeScript project references
- ✅ Build tooling and development scripts

### What's Coming Later

- ❌ Invoice CRUD (MongoDB + Mongoose)
- ❌ Customer management
- ❌ Local Solana validator integration (SPL Token, demo keypairs)
- ❌ Demo USDC payment detection
- ❌ Payment verification logic
- ❌ PDF invoice/receipt generation
- ❌ Local data persistence

## Architecture

This is a monorepo using pnpm workspaces with clean architecture principles.

### Project Structure

```
paydraft/
├── apps/                 pnpm workspaces
│   ├── web/              React + Vite + TypeScript + Tailwind
│   │   ├── src/
│   │   │   ├── core/     App setup and routing
│   │   │   ├── features/ Feature modules (isolated, self-contained)
│   │   │   └── shared/   Reusable UI components, hooks, utilities
│   │   └── ...
│   └── api/              Express + TypeScript backend
│       ├── src/
│       │   ├── domain/        Business logic and entities
│       │   ├── application/   Use cases and services
│       │   ├── infrastructure/ External concerns (DB, Solana RPC)
│       │   └── interfaces/     HTTP controllers and routes
│       └── ...
├── packages/             pnpm workspaces
│   └── shared/           Shared types, schemas, and API contracts
├── scripts/              pnpm workspace (dev utility scripts)
│   └── src/
│       ├── setup/        Environment setup scripts
│       ├── seed/         Database seeding
│       └── reset/        Development reset
└── ...
```

### Clean Architecture Layers (API)

The API follows dependency inversion with four layers:

1. **Domain** - Core business logic, entities, value objects, and interfaces. No external dependencies.
2. **Application** - Use cases and application services. Depends on domain only.
3. **Infrastructure** - External integrations (MongoDB, Solana RPC, file system). Implements domain interfaces.
4. **Interfaces** - HTTP controllers and routes. Entry point for requests.

**Dependency Rule**: Outer layers depend inward. Domain is completely independent.

### Frontend Architecture

Feature-based organization with clear boundaries:

- **Core** - Application setup, routing, global providers
- **Features** - Self-contained modules (future: invoices, customers, payments)
- **Shared** - Reusable components, hooks, and utilities

## Stack

### Current

- **Frontend**: React 18, Vite 6, TypeScript 5, Tailwind CSS 3
- **Backend**: Node.js, Express 4, TypeScript 5
- **Tooling**: pnpm workspaces, TypeScript project references
- **Architecture**: Clean architecture, SOLID principles, feature-based modules

### Later (Not Yet Implemented)

- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Solana Web3.js, SPL Token SDK for local validator
- **Demo Signing**: Backend demo-signing with local Solana keypairs (no browser wallet)
- **PDF**: Invoice/receipt generation library
- **Validation**: Zod or similar schema validation

All Solana operations will run on a **local Solana validator** with **Demo USDC** (mock SPL token, no monetary value). No browser wallets or external networks.

## Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Docker and Docker Compose (for MongoDB)

### Installation

Install all workspace dependencies:

```bash
pnpm install
```

### MongoDB Setup

Start MongoDB using Docker Compose (binds to 127.0.0.1 only):

```bash
docker compose up -d
```

Stop MongoDB:

```bash
docker compose down
```

Stop MongoDB and remove volumes:

```bash
docker compose down -v
```

MongoDB runs on `mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft?authSource=admin` (loopback only, not accessible from other machines).

### Type Checking

Run TypeScript type checking across all workspaces:

```bash
pnpm type-check
```

### Building

Build the API:

```bash
pnpm build:api
```

Build the web frontend:

```bash
pnpm build:web
```

### Development

Copy environment variables:

```bash
cp .env.example .env
```

Start MongoDB:

```bash
docker compose up -d
```

Run the API dev server:

```bash
pnpm dev:api
```

The API will start at `http://localhost:3001` with health check at `/health`.

Run the web dev server:

```bash
pnpm dev:web
```

The web app will start at `http://localhost:5173` with a basic welcome page.

**Important**: The API requires MongoDB to be running. If MongoDB is unavailable, the API will fail to start with a clear error message. Ensure `docker compose up -d` completes successfully before running `pnpm dev:api`.

**Note**: Invoice and payment functionality are not yet implemented.

## Development Guidelines

### SOLID Principles

- **Single Responsibility** - Each class/function has one reason to change
- **Open-Closed** - Open for extension, closed for modification
- **Liskov Substitution** - Subtypes must be substitutable for their base types
- **Interface Segregation** - Many specific interfaces over one general interface
- **Dependency Inversion** - Depend on abstractions, not concretions

### Module Boundaries

- Workspace packages (`apps/*`, `packages/*`, `scripts`) are isolated
- No circular dependencies between workspaces
- API contracts live in `packages/shared` (single source of truth)
- Features should be self-contained with minimal coupling

### Composition Over Inheritance

Prefer composition and dependency injection. Services receive dependencies through constructors.

### Local-First Architecture

All data is stored locally. Operations are designed for offline-first use. Solana integration runs on a local validator for payment verification only, not primary data storage. No external networks or browser wallets.

## Future Roadmap

1. **Invoice Management** - CRUD operations, MongoDB persistence
2. **Customer Management** - Store customer details locally
3. **Solana Integration** - Local validator setup, Demo USDC mock token, backend demo-signing
4. **Payment Verification** - Verify payments on local Solana validator
5. **PDF Generation** - Export invoices and receipts
6. **Local Data Sync** - Robust local storage with backup

## License

Private project for demonstration purposes.
