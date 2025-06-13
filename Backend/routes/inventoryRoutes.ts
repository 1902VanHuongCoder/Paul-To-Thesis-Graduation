import express from "express";
import {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  exportInventory,
} from "../controllers/inventoryController";

const router = express.Router();

// GET all inventory records
router.get("/", getAllInventories);

// GET a specific inventory record by ID
router.get("/:inventoryID", getInventoryById);

// POST a new inventory record
router.post("/", createInventory);

// PUT (update) an existing inventory record by ID
router.put("/:inventoryID", updateInventory);

// DELETE an inventory record by ID
router.delete("/:inventoryID", deleteInventory);

router.post("/export", exportInventory); 

export default router;