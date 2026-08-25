import "dotenv/config";

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";

import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://otel-collector:4317";

// Traces

const traceExporter = new OTLPTraceExporter({
  url: otlpEndpoint,
});

// Metrics

const metricExporter = new OTLPMetricExporter({
  url: otlpEndpoint,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000,
});

// OpenTelemetry

const sdk = new NodeSDK({
  traceExporter,
  metricReader,

  serviceName: "ticket-booking-service",

  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log("OpenTelemetry initialized");
