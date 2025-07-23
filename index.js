import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

const recordSchema = new mongoose.Schema({
  operator: String,
  machine: String,
  shift: String,
  date: Date,
  output: Number,
  remarks: String,
});

const Record = mongoose.model("Record", recordSchema);

app.post("/api/records", async (req, res) => {
  try {
    const newRecord = new Record(req.body);
    await newRecord.save();
    res.status(201).json({ message: "Record added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/records", async (req, res) => {
  try {
    const records = await Record.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => {
  console.log(" Server running at http://localhost:5001");
});
