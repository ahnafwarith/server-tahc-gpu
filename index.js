const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 1000;

// Middleware
app.use(cors());
app.use(express.json());





// Home
app.get('/', (req, res) => {
    res.send("This is the server of tahc-re-labs project")
})

// Port
app.listen(port, () => {
    console.log('listening to port', port)
})