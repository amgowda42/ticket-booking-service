# Architecture

## Current implementation

```mermaid
flowchart LR
  C[Browser / API client] --> N[Nginx]
  N --> A[Express API]
  A --> M[(MongoDB)]
  A --> J[In-process expiry sweep]
  J --> M
  A --> L[Structured logs]
  A --> H[/health and /metrics]
```

The API is a TypeScript Express service. It exposes authentication, events, bookings, health, and metrics routes. Mongoose persists `User`, `Event`, and `Booking` data in MongoDB.

The service starts an expiry sweep every 60 seconds. It finds pending bookings past their ten-minute hold deadline, marks them expired, and restores their seats in a MongoDB transaction.

Nginx is included in Docker Compose as a reverse proxy. It applies a per-client rate limit of five requests per second to `/bookings`, with a burst allowance of ten.

## Request paths

- Registration/login: client → Express → MongoDB → JWT response
- Create event: authenticated admin → Express → MongoDB
- Create booking: authenticated user → Express → MongoDB transaction that decrements availability and creates a pending booking
- Confirm booking: authenticated booking owner → Express → MongoDB

## Boundary of the current design

The API is currently stateful with respect to its in-process expiry scheduler. Running multiple API replicas would cause each replica to run the sweep. The update operation makes an individual expiry claim safe, but a dedicated worker/queue is the intended production design; see [Scaling and production](scaling-and-production.md).
