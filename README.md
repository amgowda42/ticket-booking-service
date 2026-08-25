# Ticket Booking Service

A containerised ticket-booking API for creating events, reserving seats, confirming bookings, and returning seats when reservation holds expire.

> **Project status:** active development. The API, MongoDB-backed booking flow, hold-expiry worker, Docker image, and Nginx proxy are implemented. The production roadmap identifies items still to be completed before a public production launch.

## Highlights

- JWT authentication with `user` and `admin` roles
- Admin-only event creation and public event listing
- Atomic seat reservation with MongoDB transactions
- Ten-minute pending-booking hold; expired holds restore inventory
- Docker multi-stage build, non-root runtime user, health endpoint, graceful shutdown
- Nginx reverse proxy with booking-route rate limiting
- Structured Pino logs and a Prometheus-compatible `/metrics` endpoint
- OpenTelemetry traces and metrics through an OTLP Collector, Jaeger, Prometheus, and Grafana

## Technology

Node.js, TypeScript, Express, MongoDB/Mongoose, JWT, Docker, Docker Compose, Nginx, Pino, OpenTelemetry, Jaeger, Prometheus, and Grafana. A Next.js client application lives in [`view/`](view/).

## Quick start

Prerequisites: Node.js 22+, npm, and a MongoDB deployment capable of transactions (a replica set, including a single-node replica set for local development).

```bash
npm install
```

Create a local `.env` file (never commit it):

```env
NODE_ENV=development
PORT=3000
APP_NAME=ticket-booking-service
MONGO_URI=mongodb://localhost:27017/ticket-booking
JWT_SECRET=replace-with-a-long-random-secret
```

```bash
npm run dev
```

The service is available at `http://localhost:3000`; check it with `GET /health`.

For a production-style container build, set `MONGO_URI` and `JWT_SECRET` in your environment, then run:

```bash
docker compose up --build
```

The Compose stack exposes the API through Nginx on `http://localhost`, the API directly on `http://localhost:8001`, Jaeger on `http://localhost:16686`, Prometheus on `http://localhost:9090`, and Grafana on `http://localhost:3000`.

## Documentation

The complete Markdown documentation is in [`docs/`](docs/README.md).

| Topic                                                  | Description                                        |
| ------------------------------------------------------ | -------------------------------------------------- |
| [Architecture](docs/architecture.md)                   | Current component layout and request paths         |
| [API reference](docs/api-reference.md)                 | Routes, access control, and request examples       |
| [Booking lifecycle](docs/booking-lifecycle.md)         | Inventory protection and expiry behaviour          |
| [Local development](docs/local-development.md)         | Setup, environment, and commands                   |
| [Data model](docs/data-model.md)                       | MongoDB collections and relationships              |
| [Operations](docs/operations.md)                       | Health, logging, metrics, containers, and runbooks |
| [Scaling & production](docs/scaling-and-production.md) | Current limits and production target architecture  |

## Repository layout

```text
src/       Express API, domain models, controllers, jobs, and configuration
view/      Next.js web client
docs/      Project documentation
Dockerfile Production API image
docker-compose.yml  API, observability stack, and Nginx local deployment
nginx.conf Reverse proxy and booking rate-limit configuration
otel-collector-config.yml OpenTelemetry Collector pipelines
prometheus.yml Prometheus scrape configuration
```

## Security note

Do not commit `.env` files, JWT secrets, database connection strings, or production credentials. Use a secret manager in deployment environments.
