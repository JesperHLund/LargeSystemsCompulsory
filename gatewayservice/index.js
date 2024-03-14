const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/forward", async (req, res) => {
    const { param, ...rest } = req.body;

    let url;
    if (param === 'add') {
        url = 'http://add-service:3003/add';
    } else if (param === 'subtract') {
        url = 'http://subtract-service:3002/subtract';
    } else {
        res.status(400).send({ error: 'Invalid parameter' });
        return;
    }

    try {
        const response = await axios.post(url, rest);
        res.send(response.data.result);
    } catch (error) {
        res.status(500).send({ error: 'Error forwarding request' });
    }
}); 

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});