import 'dotenv/config';
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // or just use global fetch in Node >=18

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

const DRIVERS_SOURCE_URL = process.env.DRIVERS_SOURCE_URL;
const TEAMS_SOURCE_URL = process.env.TEAMS_SOURCE_URL;
const RACES_SOURCE_URL = process.env.RACES_SOURCE_URL;

app.get("/v1/drivers", async (req, res) => {
  try {
    const response = await fetch(DRIVERS_SOURCE_URL);
    const data = await response.json();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

app.get("/v1/teams", async (req, res) => {
  try {
    const response = await fetch(TEAMS_SOURCE_URL);
    const data = await response.json();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

app.get("/v1/races", async (req, res) => {
  try {
    const response = await fetch(RACES_SOURCE_URL);
    const data = await response.json();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch races" });
  }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
