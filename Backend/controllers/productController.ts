import { Request, Response } from "express";
import { Category, Origin, Product, ProductAttribute, SubCategory, Tag } from "../models";

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: SubCategory },
        { model: Tag },
        { model: Origin },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category },
        { model: SubCategory },
        { model: Tag },
        { model: Origin },
        { model: ProductAttribute },
      ],
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { productName, productPrice, quantityAvailable, categoryID, tagID, originID, subcategoryID, images } = req.body;

  try {
    const newProduct = await Product.create({
      productName,
      productPrice,
      quantityAvailable,
      categoryID,
      tagID,
      originID,
      subcategoryID,
      images,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { productName, productPrice, quantityAvailable, categoryID, tagID, originID, subcategoryID, images } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await product.update({
      productName,
      productPrice,
      quantityAvailable,
      categoryID,
      tagID,
      originID,
      subcategoryID,
      images,
    });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Delete related records in ProductAttribute
    await ProductAttribute.destroy({ where: { productID: id } });

    // Delete the product
    await product.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};