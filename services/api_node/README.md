# API Node Service

Production-ready Node.js + Express backend skeleton.

## Setup

```bash
cp .env.example .env
npm install
```

## Required environment variables

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=app_db
```

## Running

```bash
npm run dev
```

## Database migrations

```bash
npm run db:migrate
```

To view applied migrations:

```bash
npm run db:status
```

## Tests

```bash
npm test
```
