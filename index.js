const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u6euqsi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('horse-trade-sale').collection('categories');
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