# Interfaces Layer

HTTP controllers and routes. Entry point for external requests.

## Structure

- `controllers/` - HTTP request handlers
- `routes/` - Route definitions
- `middleware/` - Express middleware (future: auth, validation, etc.)
- `validators/` - Request validation (future)

## Rules

- Depends on application and domain layers
- Handles HTTP concerns only
- Delegates business logic to application services
- Returns responses in contract format (from @paydraft/shared)
