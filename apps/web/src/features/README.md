# Features

Feature-based organization. Each feature is a self-contained module.

## Structure

Each feature folder contains:
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `services/` - API calls and business logic (future)
- `types/` - Feature-specific types (future)
- `FeatureName.tsx` - Main feature component
- `index.ts` - Public exports

## Future Features

- `invoices/` - Invoice creation and management
- `customers/` - Customer management
- `payments/` - Payment processing with Demo USDC
- `settings/` - App settings

## Rules

- Features should be as isolated as possible
- Shared code goes in `src/shared/`
- Inter-feature communication via props or state management
- API contracts from `@paydraft/shared`
