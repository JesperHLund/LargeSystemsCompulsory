import { useState, useEffect } from "react";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/react/integrations";
import "./App.css";

Sentry.init({
  dsn: "https://95d587b639c3b8084a5cde95eea98d98@o4506960048881664.ingest.us.sentry.io/4506960050585600",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});

function App() {
  useEffect(() => {
    fetch("http://localhost/history")
      .then((response) => response.json()) // parse the response as JSON
      .then((data) => console.log(data))
      .then((data) => setHistory(data)) // log the parsed response
      .catch((error) => console.error("Error:", error)); // log any error that occurred
  }, []);

  const [history, setHistory] = useState({ addResult: [], subtractResult: [] });
  const [numberOne, setNumberOne] = useState();
  const [numberTwo, setNumberTwo] = useState();
  const [operation, setOperation] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost/forward", {
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
    }
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
      <div>
        <h2>Add History</h2>
        <table>
          <thead>
            <tr>
              <th>Number One</th>
              <th>Number Two</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {history.addResult.map((item) => (
              <tr key={item.id}>
                <td>{item.number_one}</td>
                <td>{item.number_two}</td>
                <td>{item.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Subtract History</h2>
        <table>
          <thead>
            <tr>
              <th>Number One</th>
              <th>Number Two</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {history.subtractResult.map((item) => (
              <tr key={item.id}>
                <td>{item.number_one}</td>
                <td>{item.number_two}</td>
                <td>{item.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Sentry.withProfiler(
  Sentry.withErrorBoundary(App, {
    fallback: ({ error, componentStack, resetError }) => (
      <div>
        <div>
          You had an error in your application. Check the console for more info.
        </div>
        <div>{error.toString()}</div>
        <div>{componentStack}</div>
        <button onClick={resetError}>Click here to reset!</button>
      </div>
    ),
  }),
  { name: "App" }
);
