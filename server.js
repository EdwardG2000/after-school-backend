import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let lessonsCollection;
let ordersCollection;

async function connectDB() {
  await client.connect();
  const db = client.db("lessonsDB");
  lessonsCollection = db.collection("lessons");
  ordersCollection = db.collection("orders");
  console.log("✅ Connected to MongoDB Atlas");
}
connectDB();

app.get("/lessons", async (req, res) => {
  const lessons = await lessonsCollection.find().toArray();
  res.json(lessons);
});

app.post("/orders", async (req, res) => {
  const order = req.body;
  await ordersCollection.insertOne(order);
  res.json({ message: "Order saved!" });
});

// TEMPORARY ROUTE TO SEED FEWER LESSONS
app.get("/seed-lessons", async (req, res) => {
  const seedData = [
    {
      subject: "Math",
      location: "Hendon",
      price: 100,
      spaces: 5,
      image: "https://images.unsplash.com/photo-1509223197845-458d87318791",
    },
    {
      subject: "English",
      location: "Colindale",
      price: 90,
      spaces: 5,
      image: "https://images.unsplash.com/photo-1498075702571-ecb018f3752d",
    },
    {
      subject: "Science",
      location: "Brent Cross",
      price: 110,
      spaces: 5,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    },
    {
      subject: "Coding",
      location: "Edgware",
      price: 120,
      spaces: 5,
      image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
    },
  ];

  await lessonsCollection.deleteMany({});
  await lessonsCollection.insertMany(seedData);

  res.json({ message: "4 lessons with images added!" });
});
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
