import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.bukpahx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();
    console.log("Mongodb is connected");

    const Products = client.db("ema-john").collection("products");

    // get products
    app.get("/api/products", async (req, res) => {
        const page = Number(req.query.page) || 0;
        const limit = Number(req.query.limit) || 10;
        const skip = page * limit;
        const products = Products.find().skip(skip).limit(limit);
        const result = await products.toArray();
        res.send(result);
    });

    // get products by array of IDs
    app.post("/api/products", async (req, res) => {
        const allId = req.body.map(id=> new ObjectId(id));
        const result = await Products.find({_id: {$in: allId}}).toArray();
        res.send(result);
    })

    // get total number of products
    app.get("/api/products-length", async (req, res) => {
        const result = await Products.countDocuments();
        res.send({total_products: result});
    })
    
  } catch (error) {
    console.log(error);
  }
};

run();

app.get("/", (req, res) => {
  res.send("<h1 style='text-align: center;'>Welcome to Ema-John Server</h1>");
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});