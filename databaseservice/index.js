const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3004;

app.use(cors());
app.use(express.json());