import express from "express";
import {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discountController";

const router = express.Router();

// GET all discounts
router.get("/", getAllDiscounts);

// GET a discount by ID
router.get("/:discountID", getDiscountById);

// POST create a new discount
router.post("/", createDiscount);

// PUT update a discount
router.put("/:id", updateDiscount);

// DELETE a discount
router.delete("/:id", deleteDiscount);

export default router;