const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 1000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify Json Web Token
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    /* 1st layer of protection (checking for token, if no token found will return the user --> not continue in API call) */
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    /* 2nd layer of protection */
    const token = authHeader.split(' ')[1];
    // verify a token symmetric
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            // if error, means token doesn't match so access is forbidden
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    });
}


// MongoDB

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfemw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run
async function run() {
    try {
        await client.connect()
        // Collections
        const gpusCollection = client.db('tahc-re-lab').collection('gpus')
        const bookingCollection = client.db("tahc-re-lab").collection("bookings")
        const reviewCollection = client.db("tahc-re-lab").collection("reviews")
        const userCollection = client.db("tahc-re-lab").collection("users")
        // Verify Admin custom middleware


        // ----------------------------- //
        // CRUD operations
        // -------------------- //
        // User: upsert user entry
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const options = { upsert: true }
            const filter = { email: email };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token })
        })

        // Parts: Loading one part based on id
        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await gpusCollection.findOne(filter)
            res.send(result)
        })
        // Parts: Loading all parts
        app.get('/parts', async (req, res) => {
            const result = await gpusCollection.find().toArray()
            res.send(result)
        })
        // Parts: Adding new part
        app.post('/parts', async (req, res) => {
            const part = req.body
            const result = await gpusCollection.insertOne(part);
            res.send(result)
        })
        // Parts: Deleting a part
        app.delete('/parts/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await gpusCollection.deleteOne(filter)
            res.send(result)
        })

        // Bookings: Posting a booking
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })
        // Bookings: Getting all booking
        app.get('/bookings', async (req, res) => {
            const result = await bookingCollection.find().toArray();
            res.send(result);
        })
        // Bookings: Loading bookings for a particular user via email
        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            const authorization = req.headers.authorization;
            console.log('authHeader', authorization)
            const filter = { email: email };
            const result = await bookingCollection.find(filter).toArray();
            res.send(result)
        })
        // Deleting a booking
        app.delete('/deletebooking/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await bookingCollection.deleteOne(filter)
            res.send(result)
        })

        // Reviews : posting a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        // Reviews : Loading all reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray()
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