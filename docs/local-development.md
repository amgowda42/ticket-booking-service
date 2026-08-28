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

For the Compose deployment, the API uses `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317`. The collector receives OTLP traces and metrics, sends traces to Jaeger, and exposes metrics for Prometheus.

## Commands

```bash
npm install
npm run dev       # watches and runs src/index.ts
npm run build     # compiles TypeScript into dist/
npm start         # runs the compiled server
npm run profile:doctor  # profiles the compiled server with Clinic.js
```

## Container workflow

Docker Compose builds the API image and starts the observability stack and Nginx. The API is exposed directly on port 8001 and through Nginx on port 80. Jaeger, Prometheus, and Grafana are available on ports 16686, 9090, and 3001 respectively. It expects `MONGO_URI` and `JWT_SECRET` in the shell environment or `.env` file.

```bash
docker compose up --build
```

This Compose configuration does not start MongoDB; supply a reachable MongoDB deployment. Grafana starts with its default local login (`admin` / `admin`) and has no datasource or dashboard provisioning in this repository yet.
