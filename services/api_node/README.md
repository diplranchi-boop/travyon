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
JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=604800
```

## Running

```bash
npm run dev
```

### Authentication endpoints

```bash
POST /auth/login/customer
POST /auth/login/agent
POST /auth/login/admin
POST /auth/refresh
POST /auth/logout
```

The development OTP stub accepts `123456`. The development password stub accepts `password123`.

## Database migrations

```bash
npm run db:migrate
```

Seed catalog data:

```bash
npm run db:seed
```

To view applied migrations:

```bash
npm run db:status
```

## Tests

```bash
npm test
```

## Catalog endpoints

```bash
curl -X POST "http://localhost:3000/auth/login/customer" \
  -H "Content-Type: application/json" \
  -d '{"mobile":"+911234567890","otp":"123456"}'

curl -H "Authorization: Bearer <access_token>" \
  "http://localhost:3000/destinations?search=Goa&state=Goa&city=Panaji&page=1&page_size=10"

curl -H "Authorization: Bearer <access_token>" \
  "http://localhost:3000/destinations/1"

curl -H "Authorization: Bearer <access_token>" \
  "http://localhost:3000/destinations/1/hotels?page=1&page_size=10"

curl -H "Authorization: Bearer <access_token>" \
  "http://localhost:3000/packages?destination_id=1&page=1&page_size=10"
```
