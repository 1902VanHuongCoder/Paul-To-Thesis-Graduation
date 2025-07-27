import { Request, Response } from "express";
import { SubCategory ,Product, Category } from "../models";
import generateSlug from "../utils/createSlug";


// GET all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProductsByCategorySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slug } = req.params;

  try {
    const category = await Category.findOne({
      where: { categorySlug: slug },
      include: [
        {
          model: Product,
          as: "Products",
        },
        {
          model: SubCategory,
          as: "SubCategories",
        },
      ],
    });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching products by category slug:", error);
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

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { categoryName, categoryDescription } = req.body;

  try {
    const categorySlug = generateSlug(categoryName);

    // Check if category with this slug already exists
    const existingCategory = await Category.findOne({ where: { categorySlug } });
    if (existingCategory) {
      res.status(409).json({ error: "Category with this name already exists." });
      return;
    }

    // Initial count is 0
    const newCategory = await Category.create({
      categoryName,
      categoryDescription,
      categorySlug,
      count: 0,
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
  const { categoryName, categoryDescription } = req.body;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    await category.update({ categoryName, categoryDescription });
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
      res.status(404).json({ message: "Danh mục không tồn tại." });
      return;
    }

    // Delete the category
    await category.destroy();
    // Always return JSON, use 200 OK for success
    res.status(200).json({ message: "Xóa danh mục thành công." });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message:
          "Không thể xóa danh mục vì thông tin của nó đang được sử dụng trong sản phẩm. Vui lòng xóa hoặc cập nhật các sản phẩm liên quan trước.",
      });
    } else {
      res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xóa danh mục. Hãy thử lại." });
    }
  }
};