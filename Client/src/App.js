import { useState } from "react";
import "./App.css";

export default function App() {
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