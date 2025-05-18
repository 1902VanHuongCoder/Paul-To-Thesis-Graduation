import { Request, Response } from "express";
import { SubCategory ,Product, Category } from "../models";
import generateSlug from "../utils/createSlug";


// GET all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll({
      include: [Product, SubCategory], // Include related Products and SubCategories
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id, {
      include: [Product, SubCategory], // Include related Products and SubCategories
    });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { categoryName, categoryID, categoryDescription, createdAt, updatedAt } = req.body;

  try {
    const categorySlug = generateSlug(categoryName);
    const newCategory = await Category.create({
      categoryName,
      categoryID,
      categoryDescription,
      categorySlug,
      createdAt,
      updatedAt
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) a category by ID
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { categoryName } = req.body;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    await category.update({ categoryName });
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a category by ID
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Delete the category
    await category.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};