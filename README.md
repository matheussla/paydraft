# Paydraft

**⚠️ Local Demo Only – No Monetary Value**

Local-only invoicing application with Demo USDC payments on a local Solana validator. All operations run entirely on your machine. Demo USDC tokens are mock SPL tokens with **no monetary value**.

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Docker and Docker Compose (for MongoDB)
- Solana CLI (for local validator)

### Setup and Run

1. **Install dependencies:**

```bash
pnpm install
```

2. **Start MongoDB (loopback only):**

```bash
docker compose up -d
```

MongoDB runs on `127.0.0.1:27017` (not accessible from other machines).

3. **Start local Solana validator** (separate terminal):

```bash
solana-test-validator
```

Keep this running. Validator runs on `http://127.0.0.1:8899`.

4. **Initialize Solana environment:**

```bash
pnpm solana:init
```

Creates Demo USDC mint, generates keypairs, airdrops SOL, mints 1,000,000 Demo USDC to client.

5. **Verify infrastructure:**

```bash
pnpm setup
```

Checks MongoDB, Solana validator, and config readiness.

6. **Seed sample data:**

```bash
pnpm seed
```

Creates unpaid sample invoice totaling **800 Demo USDC** (800,000,000 integer units).

7. **Start API server:**

```bash
pnpm dev:api
```

API runs on `http://localhost:3001`.

8. **Start web frontend** (new terminal):

```bash
pnpm dev:web
```

Web app runs on `http://localhost:5173`.

### Reset Environment

To clear database and re-seed:

```bash
pnpm reset
```

## Demo Payment Flow

This application demonstrates a local-only invoice payment workflow:

1. **Create Invoice** - Generate invoice with customer details and line items (total: **800 Demo USDC** sample)
2. **Issue Invoice** - Backend stores invoice in local MongoDB and generates payment link
3. **Demo Pay** - Demo payment flow (no browser wallet required) where backend signs with local keypairs
4. **Verify** - Backend detects payment on local Solana validator, verifies amount matches invoice
5. **Receipt** - Generate receipt and mark invoice as paid in local database

**⚠️ Important Notes:**
- Sample invoice totals **800 Demo USDC** (800,000,000 integer units with 6 decimals)
- Demo USDC tokens have **no monetary value** - they are mock SPL tokens for local testing only
- All operations run on a **local Solana validator** on your machine
- **Local-only environment** - not connected to devnet or mainnet

## Architecture

Modular monorepo with clean architecture principles, built on pnpm workspaces.

### Project Structure

```
paydraft/
├── apps/                 # pnpm workspaces
│   ├── web/              # React + Vite + TypeScript + Tailwind
│   │   ├── src/
│   │   │   ├── core/     # App setup and routing
│   │   │   ├── features/ # Feature modules (isolated, self-contained)
│   │   │   └── shared/   # Reusable UI components, hooks, utilities
│   │   └── ...
│   └── api/              # Express + TypeScript backend
│       ├── src/
│       │   ├── domain/        # Business logic and entities
│       │   ├── application/   # Use cases and services
│       │   ├── infrastructure/ # External concerns (DB, Solana RPC)
│       │   └── interfaces/     # HTTP controllers and routes
│       └── ...
├── packages/             # pnpm workspaces
│   └── shared/           # Shared types, schemas, and API contracts
├── scripts/              # pnpm workspace (dev utility scripts)
│   └── src/
│       ├── setup/        # Environment setup scripts
│       ├── seed/         # Database seeding
│       └── reset/        # Development reset
└── ...
```

### Clean Architecture Layers (Backend API)

The API follows clean architecture with strict dependency inversion:

**1. Domain Layer**
- Core business logic, entities, value objects, and interfaces
- Pure TypeScript with no external dependencies
- Defines contracts (interfaces) for infrastructure concerns
- Independent of frameworks, databases, or external services

**2. Application Layer**
- Use cases and application services
- Orchestrates domain logic
- Depends on domain layer only
- Framework-agnostic business workflows

**3. Infrastructure Layer**
- External integrations: MongoDB, Solana RPC, file system
- Implements domain interfaces
- Concrete implementations of repositories and external services
- Contains framework-specific code

**4. Interfaces Layer**
- HTTP controllers and routes (Express)
- Entry point for external requests
- Maps HTTP to application use cases
- Handles serialization and validation

**Dependency Rule:** Dependencies point inward. Domain has zero dependencies. Outer layers depend on inner layers, never the reverse.

### Frontend Architecture

Feature-based organization with clear module boundaries:

- **Core** - Application setup, routing, global providers, configuration
- **Features** - Self-contained feature modules (invoices, payments, receipts)
- **Shared** - Reusable UI components, hooks, utilities, and types

Each feature is isolated and communicates via defined contracts in the shared package.

## Technology Stack

**Frontend**
- React 18, Vite 6, TypeScript 5
- Tailwind CSS 3 for styling

**Backend**
- Node.js, Express 4, TypeScript 5
- MongoDB with Mongoose ODM
- Solana Web3.js, SPL Token SDK for local validator integration

**Blockchain**
- Local Solana validator (solana-test-validator)
- Demo USDC: Mock SPL token (6 decimals, no monetary value)
- Backend demo-signing with local keypairs (no browser wallet required)

**Tooling**
- pnpm workspaces (monorepo)
- TypeScript project references
- Vitest (testing)
- Docker Compose (MongoDB)

**Architecture Principles**
- Clean architecture with dependency inversion
- SOLID principles
- Feature-based modular organization
- Composition over inheritance

## Test Results

Test suite validates core business logic: money arithmetic, payment flow, concurrency handling, and reconciliation.

**Status:** ✅ All 29 tests passing

Test coverage at commit `06631d0ad4f10273569e7cfa9b2a7de4b4098612` (INV-015):

- **Money Math** (11 tests): BigInt integer unit arithmetic, precision, edge cases
- **Payment Flow** (9 tests): Invoice creation, payment detection, amount verification, status updates
- **Concurrency** (5 tests): Concurrent payment handling, race conditions, duplicate detection
- **Reconciliation** (4 tests): Payment matching, status synchronization, error recovery

**Test Environment:**
- Local MongoDB on `127.0.0.1:27017` (loopback)
- Local Solana validator on `http://127.0.0.1:8899`
- Vitest with isolated test database

**Run Tests:**

```bash
pnpm test
```

All tests execute against local infrastructure only. No external networks or services required.

## Detailed Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

Installs all workspace dependencies using pnpm workspaces.

### 2. Start MongoDB (Loopback Only)

```bash
docker compose up -d
```

MongoDB runs on `127.0.0.1:27017` (loopback interface only - not accessible from other machines).

Connection string: `mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft?authSource=admin`

### 3. Start Local Solana Validator

In a separate terminal:

```bash
solana-test-validator
```

**Keep this terminal running.** The validator runs on `http://127.0.0.1:8899`.

### 4. Initialize Solana Environment

```bash
pnpm solana:init
```

This script:
- Generates freelancer and client keypairs (`.solana/keypairs/*.json`, gitignored)
- Airdrops SOL to both accounts
- Creates Demo USDC SPL token mint (6 decimals)
- Creates token accounts for freelancer and client
- Mints 1,000,000 Demo USDC to client account
- Saves configuration to `.solana/config.json`

### 5. Verify Infrastructure

```bash
pnpm setup
```

Validates that MongoDB, local Solana validator, and Solana config are ready.

### 6. Seed Sample Data

```bash
pnpm seed
```

Creates unpaid sample invoice totaling **800 Demo USDC** (800,000,000 integer units with 6 decimals).

### 7. Start Development Servers

**API Server:**

```bash
pnpm dev:api
```

Runs on `http://localhost:3001`. Health check: `/health`

**Web Frontend** (new terminal):

```bash
pnpm dev:web
```

Runs on `http://localhost:5173`.

### Reset Database

```bash
pnpm reset
```

Drops all MongoDB collections and re-seeds with sample data. Safe to run multiple times.

## Development Commands

**Type checking:**

```bash
pnpm type-check
```

Runs TypeScript type checking across all workspaces.

**Build:**

```bash
pnpm build:api
pnpm build:web
```

Builds API and web applications for production.

**Check Solana health:**

```bash
pnpm solana:health
```

Validates local validator and Demo USDC mint status.

## Solana CLI Installation

If you don't have Solana CLI installed:

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Verify installation:

```bash
solana --version
```

## MongoDB Management

**Start MongoDB:**

```bash
docker compose up -d
```

**Stop MongoDB:**

```bash
docker compose down
```

**Stop and remove volumes:**

```bash
docker compose down -v
```

MongoDB binds to `127.0.0.1:27017` (loopback only).

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
- Features are self-contained with minimal coupling

### Composition Over Inheritance

Prefer composition and dependency injection. Services receive dependencies through constructors.

### Local-First Architecture

All data is stored locally. Operations are designed for offline-first use. Solana integration runs on a local validator for payment verification only. No external networks or browser wallets.

## Git Policy

This repository uses a **single-branch workflow** (main only).

- All commits push directly to `main`
- No pull requests
- All commits authored by Matheus only

No external collaboration workflow. This is a personal project maintained exclusively by Matheus.

## License

Private project for demonstration purposes.
