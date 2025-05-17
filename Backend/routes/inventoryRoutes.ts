import express from "express";
import {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController";

const router = express.Router();

// GET all inventory records
router.get("/", getAllInventories);

// GET a specific inventory record by ID
router.get("/:id", getInventoryById);

// POST a new inventory record
router.post("/", createInventory);

// PUT (update) an existing inventory record by ID
router.put("/:id", updateInventory);

// DELETE an inventory record by ID
router.delete("/:id", deleteInventory);

export default router;