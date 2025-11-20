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

// TEMPORARY ROUTE TO SEED LESSONS
app.get("/seed-lessons", async (req, res) => {
  const seedData = [
    { subject: "Math", location: "Hendon", price: 100, spaces: 5 },
    { subject: "English", location: "Colindale", price: 90, spaces: 5 },
    { subject: "Science", location: "Brent Cross", price: 110, spaces: 5 },
    { subject: "Art", location: "Golders Green", price: 95, spaces: 5 },
    { subject: "Music", location: "Barnet", price: 80, spaces: 5 },
    { subject: "Drama", location: "Finchley", price: 85, spaces: 5 },
    { subject: "Sports", location: "Mill Hill", price: 75, spaces: 5 },
    { subject: "Coding", location: "Edgware", price: 120, spaces: 5 },
    { subject: "Chess", location: "Wembley", price: 70, spaces: 5 },
    { subject: "Dance", location: "Camden", price: 88, spaces: 5 },
  ];

  await lessonsCollection.insertMany(seedData);
  res.json({ message: "Lessons added!" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
