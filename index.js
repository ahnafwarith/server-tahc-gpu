const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 1000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfemw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run
async function run() {
    try {
        await client.connect()
        // Collections
        const gpusCollection = client.db('tahc-re-lab').collection('gpus')

        // Verify Admin custom middleware


        // ----------------------------- //
        // CRUD operations
        // -------------------- //

        // loading parts
        app.get('/parts', async (req, res) => {
            const result = await gpusCollection.find().toArray()
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)


// Home
app.get('/', (req, res) => {
    res.send("This is the server of tahc-re-labs project")
})

// Port
app.listen(port, () => {
    console.log('listening to port', port)
})