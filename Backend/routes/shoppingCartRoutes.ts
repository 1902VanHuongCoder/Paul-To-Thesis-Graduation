import express from "express";
import {
  getAllShoppingCarts,
  getShoppingCartById,
  createShoppingCart,
  removeProductFromCart,
  deleteAllShoppingCartBelongsToCustomer,
  updateCartItemQuantity,
} from "../controllers/shoppingCartController";

const router = express.Router();

// GET all shopping carts
router.get("/", getAllShoppingCarts);

// GET a specific shopping cart by ID
router.get("/:customerID", getShoppingCartById);

// POST a new shopping cart
router.post("/", createShoppingCart);

// PUT (update) an existing shopping cart by ID
router.put("/:cartID/product/:productID", updateCartItemQuantity);

// DELETE /api/shopping-cart/:cartID/product/:productID
router.delete("/:cartID/product/:productID", removeProductFromCart);

router.delete("/customer/:customerID", deleteAllShoppingCartBelongsToCustomer);


export default router;