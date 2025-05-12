import express from "express";
import {
  getAllProductAttributes,
  getProductAttributeById,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
} from "../controllers/productAttributeController";

const router = express.Router();

// GET all product attributes
router.get("/", getAllProductAttributes);

// GET a product attribute by ID
router.get("/:id", getProductAttributeById);

// POST a new product attribute
router.post("/", createProductAttribute);

// PUT (update) a product attribute by ID
router.put("/:id", updateProductAttribute);

// DELETE a product attribute by ID
router.delete("/:id", deleteProductAttribute);

export default router;