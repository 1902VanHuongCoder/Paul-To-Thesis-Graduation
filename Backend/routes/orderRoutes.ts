import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByUserID,
  getTopUsersByOrders,
  bulkUpdateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

// GET all orders
router.get("/", getAllOrders);

// GET top 5 users by orders
router.get("/statistic/top-users", getTopUsersByOrders);

// GET a specific order by ID
router.get("/:orderID", getOrderById);

// POST a new order
router.post("/", createOrder);

// Update many order status
router.put("/bulk-update-status", bulkUpdateOrderStatus);

// PUT (update) an existing order by ID
router.put("/:orderID", updateOrder);

// DELETE an order by ID
router.delete("/:orderID", deleteOrder);

// Get orders by user ID
router.get("/history/:userID", getOrdersByUserID); 

export default router;