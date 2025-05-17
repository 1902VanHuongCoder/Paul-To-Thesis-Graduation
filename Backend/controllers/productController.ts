import { Request, Response } from "express";
import { Category, Origin, Product, ProductAttribute, ProductTag, SubCategory, Tag } from "../models";

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: SubCategory },
        { model: Tag }, // Include associated tags
        { model: Origin },
        { model: ProductAttribute }, // Include associated attributes
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
        { model: Tag }, // Include associated tags
        { model: Origin },
        { model: ProductAttribute }, // Include associated attributes
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
  const {
    productName,
    productPrice,
    quantityAvailable,
    categoryID,
    tagIDs, // Array of tag IDs
    originID,
    subcategoryID,
    images,
    attributes, // Additional attributes specific to the category
  } = req.body;

  try {
    // Create the product
    const newProduct = await Product.create({
      productName,
      productPrice,
      quantityAvailable,
      categoryID,
      originID,
      subcategoryID,
      images,
    });

    // Handle tags
    if (tagIDs && Array.isArray(tagIDs)) {
      const productTags = tagIDs.map((tagID: number) => ({
        productID: newProduct.productID,
        tagID,
      }));

      await ProductTag.bulkCreate(productTags);
    }

    // Handle additional attributes
    if (attributes && Array.isArray(attributes)) {
      const productAttributes = attributes.map((attr: any) => ({
        productID: newProduct.productID,
        attributeID: attr.attributeID,
        value: attr.value,
      }));

      await ProductAttribute.bulkCreate(productAttributes);
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    productName,
    productPrice,
    quantityAvailable,
    categoryID,
    tagIDs, // Array of tag IDs
    originID,
    subcategoryID,
    images,
    attributes, // Additional attributes specific to the category
  } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Update the product
    await product.update({
      productName,
      productPrice,
      quantityAvailable,
      categoryID,
      originID,
      subcategoryID,
      images,
    });

    // Handle tags
    if (tagIDs && Array.isArray(tagIDs)) {
      // Delete existing tags for the product
      await ProductTag.destroy({ where: { productID: id } });

      // Add updated tags
      const productTags = tagIDs.map((tagID: number) => ({
        productID: id,
        tagID,
      }));

      await ProductTag.bulkCreate(productTags);
    }

    // Handle additional attributes
    if (attributes && Array.isArray(attributes)) {
      // Delete existing attributes for the product
      await ProductAttribute.destroy({ where: { productID: id } });

      // Add updated attributes
      const productAttributes = attributes.map((attr: any) => ({
        productID: id,
        attributeID: attr.attributeID,
        value: attr.value,
      }));

      await ProductAttribute.bulkCreate(productAttributes);
    }

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

    // Delete related records in ProductTag and ProductAttribute
    await ProductTag.destroy({ where: { productID: id } });
    await ProductAttribute.destroy({ where: { productID: id } });

    // Delete the product
    await product.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};