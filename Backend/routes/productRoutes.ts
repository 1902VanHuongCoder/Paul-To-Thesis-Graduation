import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByID,
  getProductByName,
} from "../controllers/productController";

const router = express.Router();

// GET all products
router.get("/", getAllProducts);

// GET products by product name
router.get("/name", getProductByName);

// GET a product by ID
router.get("/:productID", getProductByID);

// POST a new product
router.post("/", createProduct);

// PUT (update) a product by ID
router.put("/:productID", updateProduct);

// DELETE a product by ID
router.delete("/:productID", deleteProduct);

export default router;
