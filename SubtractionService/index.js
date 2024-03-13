const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3002;

app.use(cors());
app.use(express.json());

const subtract = async (numberOne, numberTwo) => {
    return numberOne - numberTwo;
}

app.post("/subtract", async (req, res) => {
    const { numberOne, numberTwo } = req.body;
    const result = await subtract(numberOne, numberTwo);
    res.send({ result });
});

app.listen(PORT, () => {
    console.log(`Subtraction Service is running on port ${PORT}`);
});
