const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5555

// middleware
app.use(cors())
app.use(express.json());

/*** Database Code */
// hAjGF5PZAIr0FSz1 coffeeMaster
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.waijmz7.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeCollection = client.db('CoffeeDB').collection('coffee');


        app.get('/all', async(req, res) => {
            const cursor = coffeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.post('/coffee', async(req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.delete("/coffee/:id", async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/coffee/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await coffeCollection.findOne(query);
            res.send(result);
        })

        app.put('/coffee/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = {usert:true};
            const updatedCoffee = req.body;
            const coffee = {
                $set: {
                    name: updatedCoffee.name, 
                    quantity: updatedCoffee.quantity, 
                    suppiler: updatedCoffee.suppiler, 
                    taste: updatedCoffee.taste, 
                    category: updatedCoffee.category, 
                    details: updatedCoffee.details, 
                    photoURL: updatedCoffee.photoURL
                }
            }
            const result = await coffeCollection.updateOne(filter, coffee, options);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
/****Database code ******/

app.get('/', (req, res) => {
    res.send('Coffee making server is running..')
})

app.listen(port, () => {
    console.log(`coffee server is running on port: ${port}`);
})

