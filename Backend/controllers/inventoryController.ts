import { Request, Response } from "express";
import { Inventory, Product, Location, InventoryTransaction } from "../models";

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
  const { inventoryID } = req.params;

  try {
    const inventory = await Inventory.findByPk(inventoryID, {
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

export const createInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productID, locationID, quantityInStock, performedBy, note } = req.body;

  try {
    // Check if inventory already exists for this product & location
    let inventory = await Inventory.findOne({
      where: { productID, locationID },
    });

    if (inventory) {
      // If exists, update quantity and create transaction
      const oldQuantity = inventory.quantityInStock;
      const newQuantity = oldQuantity + quantityInStock;

      await inventory.update({ quantityInStock: newQuantity });

      await InventoryTransaction.create({
        inventoryID: inventory.inventoryID,
        quantityChange: quantityInStock,
        transactionType: "add",
        note: note,
        performedBy: performedBy.userID,
      });

      res.status(200).json(inventory);
    } else {
      // If not exists, create new inventory and transaction
      const newInventory = await Inventory.create({
        productID,
        locationID,
        quantityInStock,
      });

      await InventoryTransaction.create({
        inventoryID: newInventory.inventoryID,
        quantityChange: quantityInStock,
        transactionType: "add",
        note: "Initial stock added",
        performedBy: performedBy || "system",
      });

      res.status(201).json(newInventory);
    }
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// export inventory based on productID, locationID, and quantity from request
export const exportInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productID, locationID, quantity, performedBy, note } = req.body;

  try {
    const inventory = await Inventory.findOne({
      where: { productID, locationID },
    });

    if (!inventory) {
      res.status(404).json({ message: "Inventory record not found" });
      return;
    }

    if (inventory.quantityInStock < quantity) {
      res.status(400).json({ message: "Insufficient stock for export" });
      return;
    }

    // Update inventory quantity
    const newQuantity = inventory.quantityInStock - quantity;
    await inventory.update({ quantityInStock: newQuantity });

    // Create inventory transaction
    await InventoryTransaction.create({
      inventoryID: inventory.inventoryID,
      quantityChange: -quantity,
      transactionType: "export",
      note: note,
      performedBy: performedBy.userID,
    });

    // Update product quantity 
    const product = await Product.findByPk(productID);
    if (product) {
      const newProductQuantity = (product.quantityAvailable || 0) + quantity;
      await product.update({ quantity: newProductQuantity });
    }

    res.status(200).json(inventory);
  } catch (error) {
    console.error("Error exporting inventory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
}

// PUT (update) an existing inventory record by ID
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  const { inventoryID } = req.params;
  const { productID, locationID, quantityInStock } = req.body;

  try {
    const inventory = await Inventory.findByPk(inventoryID);

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
  const { inventoryID } = req.params;

  try {
    const inventory = await Inventory.findByPk(inventoryID);

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