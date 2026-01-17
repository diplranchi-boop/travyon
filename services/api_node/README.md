# API Node Service

## Setup

```bash
cd services/api_node
npm install
```

## Environment variables

Create a `.env` file or export the following variables as needed:

- `PORT` (default: `3000`)
- `DB_HOST` (default: `localhost`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: empty)
- `DB_NAME` (default: `app_db`)
- `DB_PORT` (default: `3306`)

## Run

```bash
npm run dev
```

## Start (production)

```bash
npm run start
```

## Health check

```bash
curl http://localhost:3000/health
```
