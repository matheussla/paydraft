# Application Layer

Use cases and application services. Orchestrates domain logic and coordinates infrastructure.

## Structure

- `services/` - Application services implementing domain interfaces
- `dtos/` - Data transfer objects (future)
- `use-cases/` - Specific use cases (future: CreateInvoice, SendInvoice, etc.)

## Rules

- Depends on domain layer only
- Implements domain interfaces
- No HTTP/Express knowledge
- No database implementation details
