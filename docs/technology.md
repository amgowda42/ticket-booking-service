# Technology choices

| Technology              | Current use                         | Rationale                                                                        |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| Node.js + TypeScript    | API runtime and source language     | Fast I/O service development with compile-time checks                            |
| Express 5               | HTTP routing and middleware         | Lightweight, well-understood API framework                                       |
| MongoDB + Mongoose      | Users, events, bookings             | Flexible document models and transaction support for inventory updates           |
| JWT + bcrypt            | Authentication and password storage | Stateless bearer authentication; passwords are salted and hashed                 |
| Zod                     | Request parsing                     | Runtime validation at API boundaries                                             |
| Docker                  | API packaging                       | Reproducible, multi-stage production builds                                      |
| Nginx                   | Reverse proxy                       | Routing, compression, and initial rate limiting                                  |
| Pino                    | Application/request logging         | Structured JSON logs suitable for central aggregation                            |
| prom-client             | Metrics registry and endpoint       | Prometheus-compatible observability interface                                    |
| OpenTelemetry           | Traces and metrics instrumentation  | Auto-instrumentation and OTLP export from the Node.js API                        |
| OpenTelemetry Collector | Telemetry gateway                   | Receives OTLP data, forwards traces to Jaeger, and exposes metrics to Prometheus |
| Jaeger                  | Trace storage and UI                | Local trace inspection at `http://localhost:16686`                               |
| Prometheus              | Metrics storage and query           | Scrapes collector metrics at `http://localhost:9090`                             |
| Grafana                 | Metrics and trace dashboards        | Local dashboard UI at `http://localhost:3001`; setup is currently manual         |
| Redis/ioredis           | Dependency only; not integrated yet | Intended for distributed locks, queues, caching, or rate limits when required    |

The Next.js app in `view/` is the web-client foundation. Its user flows should stay aligned with the API contract in [API reference](api-reference.md).
