import express from "express";
import {
  getAllInventoryTransactions,
  getInventoryTransactionById,
  createInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
} from "../controllers/inventoryTransactionController";

const router = express.Router();

// GET all inventory transactions
router.get("/", getAllInventoryTransactions);

// GET a specific inventory transaction by ID
router.get("/:id", getInventoryTransactionById);

// POST a new inventory transaction
router.post("/", createInventoryTransaction);

// PUT (update) an existing inventory transaction by ID
router.put("/:id", updateInventoryTransaction);

// DELETE an inventory transaction by ID
router.delete("/:id", deleteInventoryTransaction);

export default router;