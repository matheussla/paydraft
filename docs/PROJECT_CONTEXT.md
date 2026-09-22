# Paydraft — Project Context

Use this file when picking the project back up. For day-to-day setup and run commands, see the root [README](../README.md).

**Last updated:** 2026-09-21 (America/Sao_Paulo)

## What this is

Local-only freelancer invoicing PoC with **Demo USDC** payments on a **local Solana validator**. Demo tokens have **no monetary value**. Nothing talks to Solana mainnet or devnet. No browser wallet — the API demo-signs with local keypairs.

**Canonical repo:** https://github.com/matheussla/paydraft  
**Abandoned name/repo:** `freelancer-usdc-invoice-poc` (do not use)

## Status

| Field | Value |
| --- | --- |
| Wave | INV-001 → INV-016 **complete** |
| Project phase | Idle — awaiting next brief from Matheus |
| Delivery | All acceptance criteria met; EM approved the closing wave |
| Tests | 29/29 passing against local Mongo + local validator (INV-015) |

There is no open task queue in-repo. New work starts with a new brief and a fresh task plan.

## Links

| Resource | URL |
| --- | --- |
| GitHub | https://github.com/matheussla/paydraft |
| Task board (Google Sheet) | https://docs.google.com/spreadsheets/d/18DBbjgO95OGZCu-4-Pc9n4OBkeelTI7dJHPC9aqGisY/edit |
| Spike pack (Google Doc) | https://docs.google.com/document/d/1JxX7o6nqzINWOMnGrswizoZYMEiY5BE_5M-7rDwI6Ns/edit |

## Product flow (happy path)

1. Create/edit draft invoice (line items, integer Demo USDC units, 6 decimals).
2. Issue invoice → freezes mint/recipient/amount; allocates unguessable `paymentId`.
3. Demo Pay from the web UI → API signs SPL transfer with local keypairs (invoice/payment id only).
4. Verify on-chain (mint, recipient, amount, reference, confirmation) → mark paid.
5. Reconciliation worker resumes incomplete/pending payments after restart.
6. HTML receipt (printable) with persistent demo warning banner.

Sample seed invoice totals **800 Demo USDC** (`800_000_000` integer units).

## Stack (locked)

| Layer | Choice |
| --- | --- |
| Monorepo | pnpm workspaces only |
| API | Node, Express, TypeScript, Mongoose |
| Web | React, Vite, TypeScript, Tailwind, React Router |
| DB | MongoDB via Docker Compose on `127.0.0.1:27017` |
| Chain | `solana-test-validator` on `http://127.0.0.1:8899` |
| Shared | `packages/shared` — schemas, types, API contracts |
| Tests | Vitest against real local Mongo + validator |

**Not in scope:** Next.js, browser wallets, mainnet/devnet RPCs, monetary USDC.

## Architecture constraints (standing)

- Clean architecture + SOLID on the API (domain → application → infrastructure → interfaces).
- Feature-oriented web (`core` / `features` / `shared`).
- Contracts live in `packages/shared` as the single source of truth.
- Integer token amounts only (no floating money math in domain logic).
- Local-first: loopback Mongo, gitignored Solana keypairs under `.solana/`.

## Repo layout (short)

```
paydraft/
├── apps/api/          # layered Express API + reconciliation
├── apps/web/          # React app (dashboard, invoices, pay, receipt)
├── packages/shared/   # Zod/schemas + API types
├── scripts/           # setup, seed, reset
├── docs/              # this context + any follow-on notes
└── README.md          # how to run, architecture detail, test results
```

## Git policy (hard rules)

- **Single branch:** `main` only.
- **No pull requests** — push directly to `main`.
- **Authorship:** Matheus Abreu only (`matheussla`). No tool branding, no `Co-authored-by` trailers in commits.
- Reviews happen on commits on `main`, not via PR workflow.

## Resume checklist (local)

1. `pnpm install`
2. `docker compose up -d` (Mongo on loopback)
3. Start `solana-test-validator` (keep running)
4. `pnpm solana:init` (if `.solana/` missing)
5. `pnpm setup` then `pnpm seed` (or `pnpm reset`)
6. `pnpm dev:api` → `http://localhost:3001`
7. `pnpm dev:web` → `http://localhost:5173`
8. Optional: `pnpm test` (needs Mongo + validator up)

## Wave map (INV-001 → INV-016)

| ID | Focus | Outcome |
| --- | --- | --- |
| INV-001 | Monorepo scaffold | Done on `main` |
| INV-002 | Mongo Docker Compose (loopback) | Done |
| INV-003–004 | Shared contracts / API foundation | Done (nits noted below) |
| INV-005–008 | Invoices, payments, verify, reconcile, receipts (API) | Done |
| INV-009–012 | App shell, dashboard, invoice form, payment page (UI) | Done |
| INV-013 | Receipt printable UI | Done |
| INV-014 | setup / seed / reset scripts (800 USDC sample) | Done |
| INV-015 | Money / pay / concurrency / reconciliation tests | Done (29/29) |
| INV-016 | README walkthrough + architecture + test results | Done |

### Known non-blocking nits (pre-next-wave)

From EM review after INV-003/004 (still open hygiene, not blockers):

- Reconcile shared contracts vs early spike where needed (e.g. quantity typing; nested vs flat error shape).
- Add `PAYMENT_*` / `STALE_CHAIN_CONFIG` error codes when payment work expands further.
- README per-suite test counts vs file splits may drift; trust total count + SHA in README until refreshed.

## How to start the next wave

1. Write a short brief (goal, constraints, out-of-scope).
2. Refresh or extend acceptance criteria and API contracts if behavior changes.
3. Seed tasks on the Google Sheet board (or replace it).
4. Keep git policy and architecture constraints above unless Matheus explicitly changes them.
5. Prefer small vertical slices that land on `main` with runnable evidence (`pnpm type-check`, `pnpm test` when relevant).

## One-line reminder

**Paydraft is a finished local Demo-USDC invoice PoC on `main`. Open this file + the README to resume; do not revive the abandoned `freelancer-usdc-invoice-poc` repo.**
