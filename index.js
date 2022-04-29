const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

// db name:warehouseManagement collection:product


const uri = "mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6kj22.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const warehousecollection = client.db("warehouseManagement").collection("product");

app.get('/', (req, res) => {
    res.send('running warehouse management server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})