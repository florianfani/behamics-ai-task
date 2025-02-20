import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("text_similarity");
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

connectDB();

export { db };
