import express from "express";
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagOfNewsController";

const router = express.Router();

// GET all tags
router.get("/", getAllTags);

// GET a specific tag by ID
router.get("/:id", getTagById);

// POST a new tag
router.post("/", createTag);

// PUT (update) an existing tag by ID
router.put("/:id", updateTag);

// DELETE a tag by ID
router.delete("/:id", deleteTag);

export default router;