# API Node Service

Express-based API skeleton with MySQL connection pool, environment validation, and basic health route.

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: start with nodemon
- `npm run start`: start with node
- `npm run test`: run Jest test suite
- `npm run lint`: run ESLint

## Health Check

`GET /health` returns:

```json
{ "status": "ok" }
```
