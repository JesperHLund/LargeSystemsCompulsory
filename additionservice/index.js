const { trace } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { ConsoleSpanExporter } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const winston = require('winston');
const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3003;

app.use(cors());
app.use(express.json());


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'addition-service' },
    transports: [
        new winston.transports.Console(),
    ],
});

const jaegerExporter = new JaegerExporter({
    serviceName: 'addition-service', // Replace with your service name
    host: 'jaeger', // Jaeger service defined in Docker Compose
    port: 14268, // Jaeger port mapped in Docker Compose
});

const provider = new NodeTracerProvider();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
const tracer = trace.getTracer('addition-service');


const add = (numberOne, numberTwo) => {
  return numberOne + numberTwo;
};

app.post("/add", async (req, res) => {
    const { numberOne, numberTwo } = req.body;


    const span = tracer.startSpan('do addition');
    logger.info('Doing addition', {
        reqBody: req.body,
        pid: process.pid,
    });
    try {
  if (numberOne && numberTwo) {
    const result = add(numberOne, numberTwo);
    res.send({ result });

     // After sending the response, trigger a request to another service
     axios.post('http://database-service:3004/add', { numberOne, numberTwo, result })
     .then(response => {
         console.log('Request to database service was successful');
     })
     .catch(error => {
         console.error('Error sending request to database service:', error);
     });
  } else {
    // If the request is missing required parameters, return a 400 status code
    res.send(req.body);
        }
    } catch (error) {
        logger.error('Error doing addition', error);
        span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
        res.status(500).send({ error: error.message });
    }finally{
        span.end();
    }
});

app.listen(PORT, () => {
  console.log(`Addition Service is running on port ${PORT}`);
});
