# Local development

## Requirements

- Node.js 22 or later
- npm
- MongoDB running as a replica set, because booking creation and expiry use transactions
- Docker Desktop (optional, for container testing)

## Environment

Create `.env` in the repository root:

```env
NODE_ENV=development
PORT=3000
APP_NAME=ticket-booking-service
MONGO_URI=mongodb://localhost:27017/ticket-booking
JWT_SECRET=use-a-long-random-development-secret
```

`MONGO_URI` and `JWT_SECRET` are required. The environment parser exits early with validation errors if they are missing.

## Commands

```bash
npm install
npm run dev       # watches and runs src/index.ts
npm run build     # compiles TypeScript into dist/
npm start         # runs the compiled server
npm run profile:doctor  # profiles the compiled server with Clinic.js
```

## Container workflow

Docker Compose builds the API image and starts Nginx on port 80, proxying to the API on port 8001. It expects `MONGO_URI` and `JWT_SECRET` in the shell environment or `.env` file.

```bash
docker compose up --build
```

This Compose configuration does not start MongoDB; supply a reachable MongoDB deployment.
