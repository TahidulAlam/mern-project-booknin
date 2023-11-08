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
const borrowedCollection = bookninDB.collection("borrowedCollection");

app.get("/api/bn/image", async (req, res) => {
  try {
    const result = await ImageCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.post("/api/bn/allbooks", async (req, res) => {
  try {
    const data = req.body;
    const result = await booksCollections.insertOne(data);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.get("/api/bn/allbooks", async (req, res) => {
  try {
    let queryObj = {};
    const category = req.query.category;
    if (category) {
      queryObj.category = category;
    }
    const result = await booksCollections.find(queryObj).toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/bn/allbooks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await booksCollections.findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
app.put("/api/bn/allbooks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const UpdateContent = req.body;
    const filter = { _id: new ObjectId(id) };
    const option = { upsert: true };
    const updatedProduct = {
      $set: {
        book_name: UpdateContent.book_name,
        image_link: UpdateContent.image_link,
        ratings: UpdateContent.ratings,
        quantity: UpdateContent.quantity,
        category: UpdateContent.category,
        shortDescription: UpdateContent.shortDescription,
        author_name: UpdateContent.author_name,
      },
    };
    const result = await booksCollections.updateOne(
      filter,
      updatedProduct,
      option
    );
    if (result.modifiedCount > 0) {
      res.send(result);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/bn/borrowedBooks", async (req, res) => {
  try {
    const data = req.body;
    const bookName = data.book_name;
    const book = await booksCollections.findOne({ book_name: bookName });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.quantity <= 0) {
      return res.status(400).json({ error: "Book is out of stock" });
    }
    await booksCollections.updateOne(
      { _id: book._id },
      { $inc: { quantity: -1 } }
    );
    const result = await borrowedCollection.insertOne(data);

    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while borrowing the book" });
  }
});

app.get("/api/bn/borrowedBooks", async (req, res) => {
  try {
    // if (req.query.email !== req.user.email) {
    //   return res.status(403).send({ message: "UnAutherised" });
    // }
    let query = {};
    if (req.query?.email) {
      query = { email: req.query.email };
    }
    const result = await borrowedCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.delete("/api/bn/borrowedBooks/:bookId", async (req, res) => {
  try {
    const id = req.params.bookId;
    const data = req.body;
    const bookName = data.book_name;
    const query = { _id: new ObjectId(id) };
    const result = await borrowedCollection.deleteOne(query);

    if (result.deletedCount === 1) {
      const book = await booksCollections.findOne({ book_name: bookName });
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      if (book.quantity <= 0) {
        return res.status(400).json({ error: "Book is out of stock" });
      }
      await booksCollections.updateOne(
        { _id: book._id },
        { $inc: { quantity: 1 } }
      );

      res.send({ success: true });
    } else {
      res.status(404).send({ error: "Document not found" });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send({ error: "Internal server error" });
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
