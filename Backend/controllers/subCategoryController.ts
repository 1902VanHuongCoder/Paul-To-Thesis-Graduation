import { Request, Response } from "express";
import { Category, Product, SubCategory } from "../models";
import generateSlug from "../utils/createSlug";

// GET all subcategories
export const getAllSubCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let subCategories;
    if(req.query.categoryID){
      const categoryID = req.query.categoryID as string;
      subCategories = await SubCategory.findAll({
        where: {
          categoryID
        }, 
        include: [Category], // Include the associated Category
      })
    }else{
       subCategories = await SubCategory.findAll({
      include: [Category], // Include the associated Category
    });
    }
    res.status(200).json(subCategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a subcategory by ID
export const getSubCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const subCategory = await SubCategory.findByPk(id, {
      include: [Category], // Include the associated Category
    });

    if (!subCategory) {
      res.status(404).json({ message: "Subcategory not found" });
      return;
    }

    res.status(200).json(subCategory);
  } catch (error) {
    console.error("Error fetching subcategory by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new subcategory
export const createSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    subcategoryID,
    createdAt,
    updatedAt,
    subcategoryName,
    categoryID,
  } = req.body;

  try {
    const slug = generateSlug(subcategoryName);
    const newSubCategory = await SubCategory.create({
      subcategoryID,
      createdAt,
      updatedAt,
      subcategoryName,
      categoryID,
      subcategorySlug: slug,
    });
    res.status(201).json(newSubCategory);
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) a subcategory by ID
export const updateSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { subcategoryName, categoryID } = req.body;

  try {
    const subCategory = await SubCategory.findByPk(id);

    if (!subCategory) {
      res.status(404).json({ message: "Subcategory not found" });
      return;
    }

    await subCategory.update({ subcategoryName, categoryID });
    res
      .status(200)
      .json({ message: "Subcategory updated successfully", subCategory });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a subcategory by ID
export const deleteSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const subCategory = await SubCategory.findByPk(id);

    if (!subCategory) {
      res.status(404).json({ message: "Danh mục con không tồn tại." });
      return;
    }

    // Check if any products are related to this subcategory
    const relatedProducts = await Product.count({
      where: { subcategoryID: id },
    })
    if (relatedProducts > 0) {
      res.status(400).json({
        message:
          "Không thể xóa danh mục con vì đang có sản phẩm thuộc danh mục này. Vui lòng xóa hoặc cập nhật các sản phẩm liên quan trước.",
      });
      return;
    }

    // Delete the subcategory
    await subCategory.destroy();
    res.status(200).json({ message: "Danh mục con đã được xóa thành công." });
  } catch (error: any) {
    console.error("Error deleting subcategory:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xóa danh mục con. Hãy thử lại." });
  }
};