const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const PORT = 3004;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

app.post("add", async (req, res) => {

});

app.listen(PORT, () => {
    console.log(`Database service is running on port ${PORT}`);
});