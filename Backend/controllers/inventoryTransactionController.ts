import { Request, Response } from "express";
// import InventoryTransaction from "../models/InventoryTransaction";
import { Product, InventoryTransaction } from "../models";

// GET all inventory transactions
export const getAllInventoryTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Sort by createdAt in descending order
    const transactions = await InventoryTransaction.findAll({
      include: [{ model: Product, as: "product" }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific inventory transaction by ID
export const getInventoryTransactionById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const transaction = await InventoryTransaction.findByPk(id, {
      include: [{ model: Product, as: "product" }],
    });

    if (!transaction) {
      res.status(404).json({ message: "Inventory transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching inventory transaction by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new inventory transaction
export const createInventoryTransaction = async (req: Request, res: Response): Promise<void> => {
  const { productID, quantityChange, transactionType, note, performedBy } = req.body;

  try {
    const newTransaction = await InventoryTransaction.create({
      productID,
      quantityChange,
      transactionType,
      note,
      performedBy,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing inventory transaction by ID
export const updateInventoryTransaction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { productID, quantityChange, transactionType, note, performedBy } = req.body;

  try {
    const transaction = await InventoryTransaction.findByPk(id);

    if (!transaction) {
      res.status(404).json({ message: "Inventory transaction not found" });
      return;
    }

    await transaction.update({
      productID,
      quantityChange,
      transactionType,
      note,
      performedBy,
    });

    res.status(200).json({ message: "Inventory transaction updated successfully", transaction });
  } catch (error) {
    console.error("Error updating inventory transaction:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE an inventory transaction by ID
export const deleteInventoryTransaction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const transaction = await InventoryTransaction.findByPk(id);

    if (!transaction) {
      res.status(404).json({ message: "Inventory transaction not found" });
      return;
    }

    await transaction.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting inventory transaction:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};