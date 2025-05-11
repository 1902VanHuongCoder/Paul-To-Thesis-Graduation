import express from "express";
import {
  getAllAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attributeController";

const router = express.Router();

// GET all attributes
router.get("/", getAllAttributes);

// GET an attribute by ID
router.get("/:id", getAttributeById);

// POST a new attribute
router.post("/", createAttribute);

// PUT (update) an attribute by ID
router.put("/:id", updateAttribute);

// DELETE an attribute by ID
router.delete("/:id", deleteAttribute);

export default router;