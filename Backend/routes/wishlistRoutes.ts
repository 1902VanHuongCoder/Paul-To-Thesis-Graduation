import express from "express";
import {
  getAllWishlists,
  getWishlistByCustomerId,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController";

const router = express.Router();

// GET all wishlists
router.get("/", getAllWishlists);

// GET wishlist by customer ID
router.get("/:customerID", getWishlistByCustomerId);

// POST add product to wishlist
router.post("/", addToWishlist);

// DELETE remove product from wishlist
router.delete("/", removeFromWishlist);

// DELETE clear all wishlist items for a customer
router.delete("/clear/:customerID", clearWishlist);

export default router;