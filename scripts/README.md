# Scripts

Utility scripts for local development, database seeding, and environment management.

**Note**: This is NOT an npm workspace. Scripts here are standalone executables (shell, Node.js, etc.) that operate on the monorepo.

## Structure

- `setup/` - First-time setup and environment configuration
- `seed/` - Database seeding and test data generation
- `reset/` - Reset development environment to clean state
- `deploy/` - Deployment and infrastructure scripts (if needed)

## Usage

Scripts should be executable and self-documenting. Run them directly:

```bash
./scripts/setup/init-dev.sh
# or
node scripts/seed/create-test-data.js
```

## Guidelines

- Keep scripts simple and focused on one task
- Add usage instructions at the top of each script
- Use descriptive names
- Make scripts idempotent when possible
- Log what they're doing
