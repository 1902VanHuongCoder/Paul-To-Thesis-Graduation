import express from "express";
import {
  createShippingAddress,
  getAllShippingAddresses,
  getShippingAddressById,
  updateShippingAddress,
  deleteShippingAddress,
} from "../controllers/shippingAddressController";

const router = express.Router();

// Create a new shipping address
router.post("/", createShippingAddress);

// Get all shipping addresses
router.get("/", getAllShippingAddresses);

// Get a shipping address by ID
router.get("/:id", getShippingAddressById);

// Update a shipping address by ID
router.put("/:id", updateShippingAddress);

// Delete a shipping address by ID
router.delete("/:id", deleteShippingAddress);

export default router;