const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3002;

app.use(cors());
app.use(express.json());

const subtract = async (numberOne, numberTwo) => {
  return numberOne - numberTwo;
};

app.post("/subtract", async (req, res) => {
  const { numberOne, numberTwo } = req.body;
  if (numberOne && numberTwo) {
    const result = await subtract(numberOne, numberTwo);
    res.send({ result });

    // After sending the response, trigger a request to another service
    axios
      .post("http://localhost:3004/subtract", { numberOne, numberTwo, result })
      .then((response) => {
        console.log("Request to database service was successful");
      })
      .catch((error) => {
        console.error("Error sending request to database service:", error);
      });
  } else {
    // If the request is missing required parameters, return a 400 status code
    res.send(req.body);
  }
});

app.listen(PORT, () => {
  console.log(`Subtraction Service is running on port ${PORT}`);
});
