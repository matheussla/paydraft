# Domain Layer

Core business logic and entities. This layer has no dependencies on external frameworks or infrastructure.

## Structure

- `interfaces/` - Domain service interfaces and repository contracts
- `entities/` - Business entities (future: Invoice, Customer, etc.)
- `value-objects/` - Immutable value objects (future: Money, InvoiceNumber, etc.)

## Rules

- No dependencies on other layers
- Pure business logic only
- Framework-agnostic
- Define interfaces that outer layers implement
