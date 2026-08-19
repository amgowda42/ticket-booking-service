# Operations

## Health and lifecycle

`GET /health` is used by the Docker image health check. On SIGINT or SIGTERM, the server stops the expiry sweep, stops accepting HTTP connections, disconnects MongoDB, and forces exit after ten seconds if necessary.

## Logs

Pino emits structured application and HTTP logs. In production, send stdout/stderr to a central log system and include request IDs, deployment version, and alertable error rates.

## Metrics

`GET /metrics` exposes the Prometheus registry and default process metrics. The repository includes HTTP duration and in-flight request metric definitions.

**Current limitation:** `metricsMiddleware` is not registered in `src/app.ts`, so the custom HTTP request metrics are not currently recorded. Mount it before relying on those charts or alerts.

## Reverse proxy

Nginx proxies requests to the API and rate-limits booking traffic. Production should additionally terminate TLS, set suitable body/time-out limits, and publish security headers at the edge.

## Basic incident checks

1. Check `/health`, container status, and recent structured logs.
2. Check MongoDB connectivity and replica-set health.
3. Inspect booking creation conflicts and expiry-job failures.
4. Check capacity, Nginx 429 responses, latency, and error metrics.
