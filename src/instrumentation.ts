import "dotenv/config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://jaeger:4317",
});

const sdk = new NodeSDK({
  traceExporter,
  serviceName: "ticket-booking-service",

  instrumentations: [getNodeAutoInstrumentations()],
});

await sdk.start();

console.log("OpenTelemetry initialized");
