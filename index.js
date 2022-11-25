const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u6euqsi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('horse-trade-sale').collection('categories');
        const bookingsCollection = client.db('horse-trade-sale').collection('bookings');
        const buyersCollection = client.db('horse-trade-sale').collection('buyers');

        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = categoryCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });
        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await categoryCollection.find(query).toArray();
            res.send(products[0].products)
            // console.log(query)
        });
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;

            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            // console.log(result);
            res.send(result);
        });
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await buyersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token });
            }

            res.status(403).send({ accessToken: '' })
        })
        app.post('/buyers', async (req, res) => {
            const buyer = req.body;
            const result = await buyersCollection.insertOne(buyer);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('horse trade sale server is running');
})

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})