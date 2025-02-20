import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compareRoutes from "./routes/compare.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", compareRoutes);

app.get("/api", (req, res) => {
  res.send("Express server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
