const { trace } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { ConsoleSpanExporter } = require('@opentelemetry/tracing');
const winston = require('winston'); const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const PORT = 3004;

require('dotenv').config();
app.use(cors());
app.use(express.json());

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'database-service' },
    transports: [
        new winston.transports.console(),
    ],
});

const jaegerExporter = new JaegerExporter({
    serviceName: 'database-service', // Replace with your service name
    host: 'jaeger', // Jaeger service defined in Docker Compose
    port: 14268, // Jaeger port mapped in Docker Compose
});

const provider = new NodeTracerProvider();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
const tracer = trace.getTracer('database-service');

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

app.post("/add", async (req, res) => {
    const { numberOne, numberTwo, result } = req.body;

    const span = tracer.startSpan('save to database');
    logger.info('handling save to database', {
        req.body,
        hostname: os.hostname(),
        pid: process.pid,
    });

    const sql = "INSERT INTO add_history (number_one, number_two, result) VALUES (?, ?, ?)";
    db.query(sql, [numberOne, numberTwo, result], (err, dbResult) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Error saving to database' });
        } else {
            res.send({ result });
        }
    });

    span.end();
});

app.post("/subtract", async (req, res) => {
    const { numberOne, numberTwo, result } = req.body;

    const span = tracer.startSpan('save to database');
    logger.info('handling save to database', {
        req.body,
        hostname: os.hostname(),
        pid: process.pid,
    });

    const sql = "INSERT INTO subtract_history (number_one, number_two, result) VALUES (?, ?, ?)";
    db.query(sql, [numberOne, numberTwo, result], (err, dbRresult) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Error saving to database' });
        } else {
            res.send({ result });
        }
    });

    span.end();
});

app.listen(PORT, () => {
    console.log(`Database service is running on port ${PORT}`);
});