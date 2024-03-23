const { trace } = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const Sentry = require("@sentry/node");
const winston = require("winston");
const express = require("express");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const axios = require("axios");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const PORT = 3004;

require("dotenv").config();
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
app.use(cors());
app.use(express.json());

Sentry.init({
  dsn: "https://95d587b639c3b8084a5cde95eea98d98@o4506960048881664.ingest.us.sentry.io/4506960050585600",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "database-service" },
  transports: [new winston.transports.Console()],
});

const jaegerExporter = new JaegerExporter({
  serviceName: "database-service", // Replace with your service name
  host: "jaeger", // Jaeger service defined in Docker Compose
  port: 14268, // Jaeger port mapped in Docker Compose
});

const provider = new NodeTracerProvider();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
const tracer = trace.getTracer("database-service");

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  app.post("/add", async (req, res) => {
    const { numberOne, numberTwo, result } = req.body;
  
    const transaction = Sentry.startTransaction({
      op: "task",
      name: "save to database",
    });
  
    Sentry.configureScope((scope) => {
      scope.setSpan(transaction);
    });
  
    const sql =
      "INSERT INTO add_history (number_one, number_two, result) VALUES (?, ?, ?)";
    db.query(sql, [numberOne, numberTwo, result], (err, dbResult) => {
      if (err) {
        console.error(err);
        Sentry.captureException(err);
        transaction.setStatus("error");
        res.status(500).send({ error: "Error saving to database" });
      } else {
        res.send({ result });
      }
    });
  
    transaction.finish();
  });
  
  app.post("/subtract", async (req, res) => {
    const { numberOne, numberTwo, result } = req.body;
  
    const transaction = Sentry.startTransaction({
      op: "task",
      name: "save to database",
    });
  
    Sentry.configureScope((scope) => {
      scope.setSpan(transaction);
    });
  
    const sql =
      "INSERT INTO subtract_history (number_one, number_two, result) VALUES (?, ?, ?)";
    db.query(sql, [numberOne, numberTwo, result], (err, dbResult) => {
      if (err) {
        console.error(err);
        Sentry.captureException(err);
        transaction.setStatus("error");
        res.status(500).send({ error: "Error saving to database" });
      } else {
        res.send({ result });
      }
    });
  
    transaction.finish();
  });

app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Database service is running on port ${PORT}`);
});
