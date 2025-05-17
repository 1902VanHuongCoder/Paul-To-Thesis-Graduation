import { Request, Response } from "express";
import ProductAttribute from "../models/ProductAtribute";
import Product from "../models/Product";
import Attribute from "../models/Attribute";

// GET all product attributes
export const getAllProductAttributes = async (req: Request, res: Response): Promise<void> => {
  try {
    const productAttributes = await ProductAttribute.findAll({
      include: [Product, Attribute], // Include associated Product and Attribute models
    });
    res.status(200).json(productAttributes);
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a product attribute by ID
export const getProductAttributeById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const productAttribute = await ProductAttribute.findByPk(id, {
      include: [Product, Attribute], // Include associated Product and Attribute models
    });

    if (!productAttribute) {
      res.status(404).json({ message: "Product attribute not found" });
      return;
    }

    res.status(200).json(productAttribute);
  } catch (error) {
    console.error("Error fetching product attribute by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new product attribute
export const createProductAttribute = async (req: Request, res: Response): Promise<void> => {
  const { productID, attributeID, value } = req.body;

  try {
    const newProductAttribute = await ProductAttribute.create({
      productID,
      attributeID,
      value,
    });

    res.status(201).json(newProductAttribute);
  } catch (error) {
    console.error("Error creating product attribute:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) a product attribute by ID
export const updateProductAttribute = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { productID, attributeID, value } = req.body;

  try {
    const productAttribute = await ProductAttribute.findByPk(id);

    if (!productAttribute) {
      res.status(404).json({ message: "Product attribute not found" });
      return;
    }

    await productAttribute.update({
      productID,
      attributeID,
      value,
    });

    res.status(200).json({ message: "Product attribute updated successfully", productAttribute });
  } catch (error) {
    console.error("Error updating product attribute:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a product attribute by ID
export const deleteProductAttribute = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const productAttribute = await ProductAttribute.findByPk(id);

    if (!productAttribute) {
      res.status(404).json({ message: "Product attribute not found" });
      return;
    }

    // Delete the product attribute
    await productAttribute.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product attribute:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};