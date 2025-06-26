import express from "express";
import {
  getAbout,
  createAbout,
  updateAbout,
  deleteAbout,
} from "../controllers/aboutController";

const router = express.Router();

// Get about info
router.get("/", getAbout);

// Create about info
router.post("/", createAbout);

// Update about info
router.put("/", updateAbout);

// Delete about info
router.delete("/", deleteAbout);

export default router;
