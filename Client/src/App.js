import { useState } from "react";
import "./App.css";

export default function App() {
  const { trace } = require('@opentelemetry/api');
  const { NodeTracerProvider } = require('@opentelemetry/node');
  const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
  const { ConsoleSpanExporter } = require('@opentelemetry/tracing');
    const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
  const os = require('os');
  const winston = require('winston');
  const [numberOne, setNumberOne] = useState();
  const [numberTwo, setNumberTwo] = useState();
  const [operation, setOperation] = useState("");
  const [result, setResult] = useState("");
  const host = "http://localhost:3001";

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'client-service' },
        transports: [
            new winston.transports.console(),
        ],
    });

    const jaegerExporter = new JaegerExporter({
        serviceName: 'client-service', // Replace with your service name
        host: 'jaeger', // Jaeger service defined in Docker Compose
        port: 14268, // Jaeger port mapped in Docker Compose
    });

    const provider = new NodeTracerProvider();
    provider.register();
    provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
    const tracer = trace.getTracer('client-service');

    const handleSubmit = async () => {

        const span = tracer.startSpan('Parse inputs');
        logger.info('Parsing inputs', {
            hostname: os.hostname(),
            pid: process.pid,
        });

    try {
      const response = await fetch(`${host}/forward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          param: operation,
          numberOne: Number(numberOne),
          numberTwo: Number(numberTwo),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setResult(data.result);
        });
    } catch (error) {
        console.error(error);
        logger.error('error handling request', error);
        span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
        }

        span.end();
  };

  return (
    <div>
      <div className="Title">
        <h2>Conculator</h2>
      </div>
      <div className="App">
        <input
          className="Input"
          type="text"
          placeholder="First number"
          onChange={(e) => setNumberOne(e.target.value)}
        />
        <select id="operation" onChange={(e) => setOperation(e.target.value)}>
          <option value="">Select Operation</option>
          <option value="add">Add</option>
          <option value="subtract">Subtract</option>
        </select>
        <input
          className="Input"
          type="text"
          placeholder="Second Number"
          onChange={(e) => setNumberTwo(e.target.value)}
        />
        <button className="Button" onClick={() => handleSubmit()}>
          Calculate
        </button>
      </div>
      <div className="result">
        <h2>Result: {result}</h2>
      </div>
    </div>
  );
}
