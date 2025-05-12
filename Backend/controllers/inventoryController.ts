import { Request, Response } from "express";
import { Inventory, Product, Location } from "../models";

// GET all inventory records
export const getAllInventories = async (req: Request, res: Response): Promise<void> => {
  try {
    const inventories = await Inventory.findAll({
      include: [
        { model: Product, as: "product" },
        { model: Location, as: "location" },
      ],
    });
    res.status(200).json(inventories);
  } catch (error) {
    console.error("Error fetching inventories:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific inventory record by ID
export const getInventoryById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const inventory = await Inventory.findByPk(id, {
      include: [
        { model: Product, as: "product" },
        { model: Location, as: "location" },
      ],
    });

    if (!inventory) {
      res.status(404).json({ message: "Inventory record not found" });
      return;
    }

    res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new inventory record
export const createInventory = async (req: Request, res: Response): Promise<void> => {
  const { productID, locationID, quantityInStock } = req.body;

  try {
    const newInventory = await Inventory.create({
      productID,
      locationID,
      quantityInStock,
    });

    res.status(201).json(newInventory);
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing inventory record by ID
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { productID, locationID, quantityInStock } = req.body;

  try {
    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      res.status(404).json({ message: "Inventory record not found" });
      return;
    }

    await inventory.update({
      productID,
      locationID,
      quantityInStock,
    });

    res.status(200).json({ message: "Inventory updated successfully", inventory });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE an inventory record by ID
export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      res.status(404).json({ message: "Inventory record not found" });
      return;
    }

    await inventory.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};