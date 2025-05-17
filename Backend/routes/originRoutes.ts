import express from "express";
import {
  getAllOrigins,
  getOriginById,
  createOrigin,
  updateOrigin,
  deleteOrigin,
} from "../controllers/originController";

const router = express.Router();

// GET all origins
router.get("/", getAllOrigins);

// GET an origin by ID
router.get("/:id", getOriginById);

// POST a new origin
router.post("/", createOrigin);

// PUT (update) an origin by ID
router.put("/:id", updateOrigin);

// DELETE an origin by ID
router.delete("/:id", deleteOrigin);

export default router;