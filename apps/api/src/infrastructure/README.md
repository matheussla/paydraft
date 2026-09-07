# Infrastructure Layer

External concerns: database, file system, external APIs, server setup.

## Structure

- `config/` - Configuration management
- `server/` - Express server setup
- `database/` - Database connections and repositories (future)
- `external/` - External API clients (future: Solana RPC, etc.)

## Rules

- Implements domain interfaces
- Contains framework-specific code
- Handles external dependencies
- Never imported by domain layer
