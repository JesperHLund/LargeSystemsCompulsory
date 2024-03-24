const { trace } = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const winston = require("winston");
const express = require("express");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3001;

Sentry.init({
  dsn: "https://95d587b639c3b8084a5cde95eea98d98@o4506960048881664.ingest.us.sentry.io/4506960050585600",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(express.json());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "gateway-service" },
  transports: [new winston.transports.Console()],
});

const jaegerExporter = new JaegerExporter({
  serviceName: "gateway-service", // Replace with your service name
  host: "jaeger", // Jaeger service defined in Docker Compose
  port: 14268, // Jaeger port mapped in Docker Compose
});

const provider = new NodeTracerProvider();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
const tracer = trace.getTracer("gateway-service");

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.post("/forward", async (req, res) => {
  const { param, ...rest } = req.body;

  const span = tracer.startSpan("forward request");
  logger.info("handling forward request", {
    reqBody: req.body,
    pid: process.pid,
    spanId: span.spanContext().spanId,
    traceId: span.spanContext().traceId,
    parentId: span.parentSpanId,
  });

  let url;
  if (param === "add") {
    url = "http://addition-service:3003/add";
  } else if (param === "subtract") {
    url = "http://subtraction-service:3002/subtract";
  } else {
    res.status(400).send({ error: "Invalid parameter" });
    return;
  }

  try {
    const response = await axios.post(url, rest);
    res.send({ result: response.data.result });
  } catch (error) {
    Sentry.captureException(error);
    logger.error("error handling request", error);
    span.setStatus({
      code: trace.SpanStatusCode.ERROR,
      message: error.message,
    });
    res.status(500).send({ error: error.message });
  }
  span.end();
});

app.get("/history", async (req, res) => {
  try {
    const response = await axios.get("http://database-service:3004/history");
    res.send(response.data);
  } catch (error) {
    Sentry.captureException(error);
    logger.error("error handling request", error);
    res.status(500).send({ error: error.message });
  }
});

app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Gateway service is running on port ${PORT}`);
});
