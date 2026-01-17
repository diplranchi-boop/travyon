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

## Catalog seed data

The migrations include India-focused catalog seed data:

- 5 destinations
- 10 hotels linked to destinations
- 3 packages linked to destinations

## Catalog endpoints

All catalog endpoints require the `x-user-role` header:

- `CUSTOMER` and `AGENT` can read catalog data.
- `ADMIN` can read catalog data and toggle `is_live`.

### Read endpoints

- `GET /destinations?search=&state=&city=&page=`
- `GET /destinations/:id`
- `GET /destinations/:id/hotels`
- `GET /packages?destination_id=`

### Admin toggles

- `PATCH /destinations/:id` with JSON body `{ "is_live": true }`
- `PATCH /hotels/:id` with JSON body `{ "is_live": true }`
- `PATCH /packages/:id` with JSON body `{ "is_live": true }`

## Tests

```bash
npm test
```
