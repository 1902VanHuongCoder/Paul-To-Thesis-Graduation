import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Chatbot request received:", req.body);
  try {
    const response = await fetch(
      "https://d13e-34-125-190-219.ngrok-free.app/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Chatbot server error" });
  }
});

export default router;