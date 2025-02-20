import express from "express";
import { db } from "../db.js";
import axios from "axios";
import { ObjectId } from "mongodb";

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
      //"http://127.0.0.1:8000/compute-embeddings",
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

router.delete("/compare/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comparison ID" });
    }

    const result = await db.collection("comparisons").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Comparison not found" });
    }

    res.status(200).json({ message: "Comparison deleted successfully" });
  } catch (error) {
    console.error("Error deleting comparison:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
