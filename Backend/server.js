import express from "express";

const app = express();

app.get("/api/health", (req, res) => {
    res.json({
        success: true
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server Started");
});