import express from "express";
import { db } from "../db.js";
import axios from "axios";

const router = express.Router();

router.post("/compare", async (req, res) => {
  const { text1, text2, model = "sentence-transformers" } = req.body;

  if (!text1 || !text2) {
    return res.status(400).json({ error: "Both texts are required" });
  }

  try {
    const response = await axios.post(
      // use 'http://localhost:8000/compute-embeddings' if not running on docker
      "http://ai-service:8000/compute-embeddings",
      {
        text1,
        text2,
        model,
      }
    );

    const similarity = response.data.similarity;

    await db.collection("comparisons").insertOne({
      text1,
      text2,
      similarity: parseFloat(similarity),
      model,
      createdAt: new Date(),
    });

    res.json({ similarity });
  } catch (error) {
    console.error("Error in /compare:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/compare", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    const comparisons = await db
      .collection("comparisons")
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection("comparisons").countDocuments();

    res.json({
      comparisons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in /comparisons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
