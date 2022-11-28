const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u6euqsi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//     // console.log(req.headers.authorization);
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }
//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run() {
    try {
        const categoryCollection = client.db('horse-trade-sale').collection('categories');
        const bookingsCollection = client.db('horse-trade-sale').collection('bookings');
        const buyersCollection = client.db('horse-trade-sale').collection('buyers');
        const sellersCollection = client.db('horse-trade-sale').collection('sellers');
        const reportsCollection = client.db('horse-trade-sale').collection('reports');

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

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
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' });
            // }
            // console.log(req.headers.authorization);
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            // console.log(result);
            res.send(result);
        });
        app.post('/reportedItems', async (req, res) => {
            const reported = req.body;
            const result = await reportsCollection.insertOne(reported);
            res.send(result);
        })
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const resalePrice = booking.resalePrice;
            const amount = resalePrice * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment-method-types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })
        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const user = await buyersCollection.findOne(query);
        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
        //         return res.send({ accessToken: token });
        //     }

        //     res.status(403).send({ accessToken: '' })
        // })
        app.get('/buyers', async (req, res) => {
            const query = {};
            const buyers = await buyersCollection.find(query).toArray();
            res.send(buyers);
        });
        app.get('/buyers/admin/:email', async (req, res) => {
            // const id = req.params.id;
            const email = req.params.email;
            const query = { email };
            const buyer = await buyersCollection.findOne(query);
            res.send({ isAdmin: buyer?.role === 'admin' });
        })
        app.post('/buyers', async (req, res) => {
            const buyer = req.body;
            const result = await buyersCollection.insertOne(buyer);
            res.send(result);
        });
        app.get('/sellers', async (req, res) => {
            const query = {};
            const buyers = await sellersCollection.find(query).toArray();
            res.send(buyers);
        });
        app.post('/sellers', async (req, res) => {
            const seller = req.body;
            const result = await sellersCollection.insertOne(seller);
            res.send(result);
        });
        // app.put('/sellers/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const option = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'seller'
        //         }
        //     }
        //     const result = await sellersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })
        app.delete('/buyers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await buyersCollection.deleteOne(filter);
            res.send(result);
        })
        // app.put('/admin/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await buyersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })

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