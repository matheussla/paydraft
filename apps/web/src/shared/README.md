# Shared

Shared resources used across multiple features.

## Structure

- `components/` - Reusable UI components (Button, Input, Modal, etc.)
- `hooks/` - Reusable hooks (future: useApi, useAuth, etc.)
- `utils/` - Utility functions (future: formatters, validators, etc.)
- `styles/` - Global styles and Tailwind config
- `types/` - Shared TypeScript types (future)
- `constants/` - App-wide constants (future)

## Rules

- Only truly shared code belongs here
- No feature-specific logic
- Components should be generic and reusable
- Document component props with interfaces
