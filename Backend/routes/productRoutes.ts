import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

// GET all products
router.get("/", getAllProducts);

// GET a product by ID
router.get("/:id", getProductById);

// POST a new product
router.post("/", createProduct);

// PUT (update) a product by ID
router.put("/:id", updateProduct);

// DELETE a product by ID
router.delete("/:id", deleteProduct);

export default router;