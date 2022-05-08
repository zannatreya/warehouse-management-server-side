const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

// db name:warehouseManagement collection:product

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6kj22.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const warehousecollection = client.db("warehouseManagement").collection("product");

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = warehousecollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await warehousecollection.findOne(query);
            res.send(product);
        });
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            newProduct.quantity = parseInt(newProduct.quantity);
            const result = await warehousecollection.insertOne(newProduct);
            res.send(result);
        });


        // DELETE
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await warehousecollection.deleteOne(query);
            res.send(result);
        });

        app.put('/product/decrease/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await warehousecollection.updateOne(query, {
                $inc: { quantity: -1 }

            })
            res.send(inventory);
        })
        app.put('/product/increase/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const query = { _id: ObjectId(id) };
            const inventory = await warehousecollection.findOne(query);

            const newQuantity = quantity + inventory.quantity;
            const updateInventory = await warehousecollection.updateOne(query, {
                $set: { quantity: newQuantity },
            });

            res.send(updateInventory);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running warehouse management server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})