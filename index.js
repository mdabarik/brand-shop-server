const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5901

/* middleware */
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running...');
})

/************ MongoDB Database User Start **************/
const DB_USER="BrandShopUser"
const DB_PASSWORD="03e5pzQcoLa999P5"
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.waijmz7.mongodb.net/?retryWrites=true&w=majority`;


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
        const brandCollection = client.db('BrandShopDB').collection('brands');
        const prodTypesCollection = client.db('BrandShopDB').collection('productTypes');
        const productCollection = client.db('BrandShopDB').collection('products');
        const myCartCollectionsOnMongoDB = client.db('BrandShopDB').collection('cartsdata');
        const sliderCollection = client.db('BrandShopDB').collection('slidersInfo');
        const teamCollection = client.db('BrandShopDB').collection('teams');


        app.get("/brands", async (req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/product-types", async (req, res) => {
            const cursor = prodTypesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/products", async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        })
        app.post('/newprod', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })
        app.put('/edit/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { usert: true };
            const updateProduct = req.body;
            const product = {
                $set: {
                    productName: updateProduct.productName,
                    brandName: updateProduct.brandName,
                    price: updateProduct.price,
                    brandType: updateProduct.brandType,
                    shortDesc: updateProduct.shortDesc,
                    rating: updateProduct.rating,
                    photoURL: updateProduct.photoURL
                }
            }
            const result = await productCollection.updateOne(filter, product, options);
            res.send(result);
        })


        /******* Cart Collection  Start ***********/
        app.put('/mycart', async (req, res) => {
            const receivedDataFromClient = req.body;

            // my query we need two data to compare so we need $and (front mongo crud docs)
            const myPutQuery = {
                $and: [
                    { productID: receivedDataFromClient.productID },
                    { userEMAIL: receivedDataFromClient.userEMAIL }
                ]
            };

            const options = { upsert: true }; // upsert

            // new cart using $set
            const newCartToBeInserted = {
                $set: { 
                    productID: receivedDataFromClient.productID,
                    userEMAIL: receivedDataFromClient.userEMAIL }
            }

            const result = await myCartCollectionsOnMongoDB.updateOne(myPutQuery, newCartToBeInserted, options);
            res.send(result);
        })

        app.get('/mycart', async (req, res) => {
            const cursorPointer = myCartCollectionsOnMongoDB.find();
            const result = await cursorPointer.toArray();
            res.send(result);
        })

        app.delete('/mycart', async (req, res) => {
            const receivedDataFromClient = req.body;
            console.log(receivedDataFromClient);
            // my query to be inserted
            const myQuery = {
                $and: [
                    { userEMAIL: receivedDataFromClient.userEMAIL },
                    { productID: receivedDataFromClient.productID }
                ]
            }
            const result = await myCartCollectionsOnMongoDB.deleteOne(myQuery);
            res.send(result);
        })
        /******* Cart Collection  End ***********/

        // BrandShopDB.slidersInfo
            app.get('/sliders', async (req, res) => {
            const cursor = sliderCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // BrandShopDB.teams
        app.get('/teams', async (req, res) => {
            const cursor = teamCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
/************ MongoDB Database User Start **************/




app.listen(PORT, () => {
    console.log(`server is running at port: ${PORT}`);
})


// vercel
// vercel --prod