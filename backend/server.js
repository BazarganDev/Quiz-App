import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 3000;
const SCORES_FILE = "scores.json";

app.use(express.json());
app.use(cors());

function getScores() {
    if (!fs.existsSync(SCORES_FILE)) {
        return [];
    }
    const rawData = fs.readFileSync(SCORES_FILE);
    return JSON.parse(rawData);
}

function saveScores(scores) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 4));
}

app.get("/leaderboard", (req, res) => {
    const scores = getScores();
    res.json(scores);
});

app.post("/score", (req, res) => {
    const scores = getScores();
    const newScore = req.body;
    scores.push(newScore);
    saveScores(scores);
    res.status(201).json({ message: "Score Added!" });
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:3000...");
});
