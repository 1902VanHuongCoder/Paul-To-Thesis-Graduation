import express from "express";
import {
  createShippingAddress,
  getAllShippingAddresses,
  getShippingAddressById,
  updateShippingAddress,
  deleteShippingAddress,
  getShippingAddressByUserID,
  updateShippingAddressStatus
} from "../controllers/shippingAddressController";

const router = express.Router();

// Create a new shipping address
router.post("/", createShippingAddress);

// Get all shipping addresses
router.get("/", getAllShippingAddresses);

// Get a shipping address by ID
router.get("/:id", getShippingAddressById);

// Get shipping addresses based on userID
router.get("/user/:userID", getShippingAddressByUserID); 

// Update shipping address using shippingAddressID and userID
router.put("/:userID/:shippingAddressID", updateShippingAddressStatus); 

// Delete a shipping address by ID
router.delete("/:userID/:shippingAddressID", deleteShippingAddress);
export default router;