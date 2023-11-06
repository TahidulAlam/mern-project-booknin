// tahidcse
// xv1krfx9dOMHRLlr

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wtp0w8h.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}

const bookninDB = client.db("bookninDB");
const booksCollections = bookninDB.collection("booksCollections");
const categoryCollection = bookninDB.collection("categoryCollection");
const ImageCollection = bookninDB.collection("ImageCollection");

app.get("/api/bn/image", async (req, res) => {
  try {
    const result = await ImageCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.post("/api/bn/addbooks", async (req, res) => {
  try {
    const data = req.body;
    const result = await booksCollections.insertOne(data);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/bn/addbooks", async (req, res) => {
  try {
    const result = await booksCollections.find().toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.get("/api/bn/category", async (req, res) => {
  try {
    const result = await categoryCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Booknin server is running");
});

app.listen(port, () => {
  console.log(`Booknin Server is running on port: ${port}`);
});
