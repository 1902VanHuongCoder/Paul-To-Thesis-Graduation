import express from "express";
import {
  getAllDeliveryMethods,
  getDeliveryMethodById,
  createDeliveryMethod,
  updateDeliveryMethod,
  deleteDeliveryMethod,
} from "../controllers/deliveryController";

const router = express.Router();

// GET all delivery methods
router.get("/", getAllDeliveryMethods);

// GET a delivery method by ID
router.get("/:deliveryID", getDeliveryMethodById);

// CREATE a new delivery method
router.post("/", createDeliveryMethod);

// UPDATE a delivery method
router.put("/:deliveryID", updateDeliveryMethod);

// DELETE a delivery method
router.delete("/:deliveryID", deleteDeliveryMethod);

export default router;