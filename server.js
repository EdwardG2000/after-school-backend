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

// LOGGER MIDDLEWARE

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// STATIC IMAGES

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/lesson-images", express.static(path.join(__dirname, "images")));

// MONGODB SETUP

const client = new MongoClient(process.env.MONGO_URI);
let lessonsCollection;
let ordersCollection;

async function connectDB() {
  await client.connect();
  const db = client.db("lessonsDB");
  lessonsCollection = db.collection("lessons");
  ordersCollection = db.collection("orders");
  console.log("Connected to MongoDB Atlas");
}
connectDB();

// GET /lessons

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

// PUT /lessons/:id

app.put("/lessons/:id", async (req, res) => {
  const lessonId = req.params.id;
  const updates = req.body;

  try {
    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: updates }
    );

    res.json({ message: "Lesson updated", result });
  } catch (error) {
    console.error("Failed to update lesson:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

//FULL-TEXT SEARCH

app.get("/search", async (req, res) => {
  const query = req.query.q?.toLowerCase() || "";

  const lessons = await lessonsCollection
    .find({
      $or: [
        { subject: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { price: { $regex: query, $options: "i" } },
        { spaces: { $regex: query, $options: "i" } },
      ],
    })
    .toArray();

  res.json(lessons);
});

// SEED ROUTE

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

  res.json({ message: "10 lessons with images added!" });
});

// START SERVER

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
