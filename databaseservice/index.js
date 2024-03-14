const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const PORT = 3004;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

app.post("/add", async (req, res) => {
    const { numberOne, numberTwo, result } = req.body;
    const sql = "INSERT INTO add_history (number_one, number_two, result) VALUES (?, ?, ?)";
    db.query(sql, [numberOne, numberTwo, result], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Error saving to database' });
        } else {
            res.send({ result });
        }
    });
});

app.post("/subtract", async (req, res) => {
    const { numberOne, numberTwo, result } = req.body;
    const sql = "INSERT INTO subtract_history (number_one, number_two, result) VALUES (?, ?, ?)";
    db.query(sql, [numberOne, numberTwo, result], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Error saving to database' });
        } else {
            res.send({ result });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Database service is running on port ${PORT}`);
});