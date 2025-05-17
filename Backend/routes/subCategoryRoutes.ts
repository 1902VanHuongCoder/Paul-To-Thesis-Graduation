import express from "express";
import {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController";

const router = express.Router();

// GET all subcategories
router.get("/", getAllSubCategories);

// GET a subcategory by ID
router.get("/:id", getSubCategoryById);

// POST a new subcategory
router.post("/", createSubCategory);

// PUT (update) a subcategory by ID
router.put("/:id", updateSubCategory);

// DELETE a subcategory by ID
router.delete("/:id", deleteSubCategory);

export default router;