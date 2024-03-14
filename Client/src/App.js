import "./App.css";
import { useState } from "react";

export default function App() {
  const [numberOne, setNumberOne] = useState();
  const [numberTwo, setNumberTwo] = useState();
  const [operation, setOperation] = useState();
  const [result, setResult] = useState("")
  const host = "http://localhost:3001";

  const handleSubmit = async () => {
    try{
      const response = await fetch(`${host}/${operation}`, {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOne: numberOne,
          numberTwo: numberTwo
        }),
      }).then((response) => response.json())
      .then((data) => {
        setResult(data.result);
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
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
  );
}
