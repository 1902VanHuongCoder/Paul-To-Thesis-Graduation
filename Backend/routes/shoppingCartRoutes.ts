import express from "express";
import {
  getAllShoppingCarts,
  getShoppingCartById,
  createShoppingCart,
  updateShoppingCart,
  deleteShoppingCart,
} from "../controllers/shoppingCartController";

const router = express.Router();

// GET all shopping carts
router.get("/", getAllShoppingCarts);

// GET a specific shopping cart by ID
router.get("/:id", getShoppingCartById);

// POST a new shopping cart
router.post("/", createShoppingCart);

// PUT (update) an existing shopping cart by ID
router.put("/:id", updateShoppingCart);

// DELETE a shopping cart by ID
router.delete("/:id", deleteShoppingCart);

export default router;