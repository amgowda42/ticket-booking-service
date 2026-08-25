# Operations

## Health and lifecycle

`GET /health` is used by the Docker image health check. On SIGINT or SIGTERM, the server stops the expiry sweep, stops accepting HTTP connections, disconnects MongoDB, and forces exit after ten seconds if necessary.

## Logs

Pino emits structured application and HTTP logs. In production, send stdout/stderr to a central log system and include request IDs, deployment version, and alertable error rates.

## Metrics

`GET /metrics` exposes the Prometheus registry, default process metrics, HTTP request duration, and in-flight request metrics. The OpenTelemetry SDK also exports metrics over OTLP to the collector. Prometheus scrapes the collector's Prometheus endpoint, and Grafana can query Prometheus for dashboards.

Prometheus is available at `http://localhost:9090`, Grafana at `http://localhost:3000`, and Jaeger at `http://localhost:16686`. The collector is an internal Compose service named `otel-collector` and listens for OTLP gRPC on port 4317 and OTLP HTTP on port 4318.

Grafana does not currently have datasources or dashboards provisioned automatically. Add Prometheus (`http://prometheus:9090`) and Jaeger (`http://jaeger:16686`) as Grafana data sources after signing in when using the local stack.

## Reverse proxy

Nginx proxies requests to the API and rate-limits booking traffic. Production should additionally terminate TLS, set suitable body/time-out limits, and publish security headers at the edge.

## Basic incident checks

1. Check `/health`, container status, and recent structured logs.
2. Check MongoDB connectivity and replica-set health.
3. Inspect booking creation conflicts and expiry-job failures.
4. Check capacity, Nginx 429 responses, latency, and error metrics.
5. Check `docker compose ps`, then inspect `docker compose logs app otel-collector prometheus jaeger` when traces or metrics are missing.
