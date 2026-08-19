# Technology choices

| Technology | Current use | Rationale |
| --- | --- | --- |
| Node.js + TypeScript | API runtime and source language | Fast I/O service development with compile-time checks |
| Express 5 | HTTP routing and middleware | Lightweight, well-understood API framework |
| MongoDB + Mongoose | Users, events, bookings | Flexible document models and transaction support for inventory updates |
| JWT + bcrypt | Authentication and password storage | Stateless bearer authentication; passwords are salted and hashed |
| Zod | Request parsing | Runtime validation at API boundaries |
| Docker | API packaging | Reproducible, multi-stage production builds |
| Nginx | Reverse proxy | Routing, compression, and initial rate limiting |
| Pino | Application/request logging | Structured JSON logs suitable for central aggregation |
| prom-client | Metrics registry and endpoint | Prometheus-compatible observability interface |
| Redis/ioredis | Dependency only; not integrated yet | Intended for distributed locks, queues, caching, or rate limits when required |

The Next.js app in `view/` is the web-client foundation. Its user flows should stay aligned with the API contract in [API reference](api-reference.md).
