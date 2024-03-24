import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  useEffect(() => {
    fetch("http://localhost/history")
      .then((response) => response.json()) // parse the response as JSON
      .then((data) => console.log(data)) // log the parsed response
      .catch((error) => console.error("Error:", error)); // log any error that occurred
  }, []);

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
    </div>
  );
}
