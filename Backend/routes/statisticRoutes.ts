import express from "express";
import {
  getStatistic,
  incrementAccessCount,
  resetStatistic
} from "../controllers/statisticController";

const router = express.Router();

// Get current statistic
router.get("/", getStatistic);

// Increment access count
router.post("/increment", incrementAccessCount);

// Reset statistic (optional, for admin)
router.post("/reset", resetStatistic);

export default router;
