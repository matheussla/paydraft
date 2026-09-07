# Scripts Workspace

Development utility scripts for local environment management, database seeding, and automation.

This is an npm workspace (`@paydraft/scripts`) containing TypeScript utility scripts.

## Structure

- `src/setup/` - First-time setup and environment configuration scripts
- `src/seed/` - Database seeding and test data generation
- `src/reset/` - Reset development environment to clean state

## Guidelines

- Write scripts in TypeScript for type safety and maintainability
- Keep scripts focused on one task
- Add usage instructions as comments at the top of each script
- Make scripts idempotent when possible
- Log what they're doing for debugging

## Future Scripts

- Initial database schema setup
- Test data generation (invoices, customers)
- Local Solana validator management
- Demo USDC token distribution
- Environment reset utilities
