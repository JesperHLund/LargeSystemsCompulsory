const { trace } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { ConsoleSpanExporter } = require('@opentelemetry/tracing');
const winston = require('winston'); const express = require("express");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const os = require('os');
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3001;

app.use(cors());
app.use(express.json());

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'gateway-service' },
    transports: [
        new winston.transports.console(),
    ],
});

const jaegerExporter = new JaegerExporter({
    serviceName: 'gateway-service', // Replace with your service name
    host: 'jaeger', // Jaeger service defined in Docker Compose
    port: 14268, // Jaeger port mapped in Docker Compose
});

const provider = new NodeTracerProvider();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
const tracer = trace.getTracer('gateway-service');

app.post("/forward", async (req, res) => {
    const { param, ...rest } = req.body;
    const span = tracer.startSpan('forward request');
    logger.info('handling forward request', {
        reqBody: req.body,
        hostname: os.hostname(),
        pid: process.pid,
    });

    let url;
    if (param === 'add') {
        url = 'http://localhost:3003/add';
    } else if (param === 'subtract') {
        url = 'http://localhost:3002/subtract';
    } else {
        res.status(400).send({ error: 'Invalid parameter' });
        return;
    }

    try {
        console.log("Rest in gateway service:", rest);
        const response = await axios.post(url, rest);
        console.log("Response in gateway service:", response.data.result)
        res.send({result: response.data.result});
    } catch (error) {
        logger.error('error handling request', error);
        span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
        res.status(500).send({ error: error.message});
    }
    span.end();
}); 

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});