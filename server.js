import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/lesson-images", express.static(path.join(__dirname, "images")));

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

// POST /orders

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
      image: "mathsimage.png",
    },
    {
      subject: "English",
      location: "Colindale",
      price: 90,
      spaces: 5,
      image: "english_image.png",
    },
    {
      subject: "Science",
      location: "Brent Cross",
      price: 110,
      spaces: 5,
      image: "science_image.png",
    },
    {
      subject: "Coding",
      location: "Edgware",
      price: 120,
      spaces: 5,
      image: "coding_image.png",
    },
    {
      subject: "Art",
      location: "Mill Hill",
      price: 85,
      spaces: 6,
      image: "Art_image.png",
    },
    {
      subject: "Music",
      location: "Finchley",
      price: 95,
      spaces: 5,
      image: "music_image.png",
    },
    {
      subject: "Drama",
      location: "Barnet",
      price: 100,
      spaces: 6,
      image: "drama_image.png",
    },
    {
      subject: "Spanish",
      location: "Muswell Hill",
      price: 105,
      spaces: 5,
      image: "spanish_image.png",
    },
    {
      subject: "Chess",
      location: "Wembley",
      price: 95,
      spaces: 6,
      image: "chess_image.png",
    },
    {
      subject: "Photography",
      location: "Greenwich",
      price: 115,
      spaces: 5,
      image: "photography_image.png",
    },
  ];

  await lessonsCollection.deleteMany({});
  await lessonsCollection.insertMany(seedData);

  res.json({ message: "4 lessons with images added!" });
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
