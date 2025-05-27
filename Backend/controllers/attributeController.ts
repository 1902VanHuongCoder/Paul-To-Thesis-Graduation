import { Request, Response } from "express";
import { Attribute, Category } from "../models";

// GET all attributes
export const getAllAttributes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let attributes;
    if (req.query.categoryID) {
      const categoryID = req.query.categoryID as string;
      attributes = await Attribute.findAll({
        where: { categoryID },
        include: [Category], // Include associated Category
      });
    } else {
      attributes = await Attribute.findAll({
        include: [Category], // Include associated Category
      });
    }
    res.status(200).json(attributes);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET an attribute by ID
export const getAttributeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const attribute = await Attribute.findByPk(id, {
      include: [Category], // Include associated Category
    });

    if (!attribute) {
      res.status(404).json({ message: "Attribute not found" });
      return;
    }

    res.status(200).json(attribute);
  } catch (error) {
    console.error("Error fetching attribute by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new attribute
export const createAttribute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    categoryID,
    name,
    label,
    data_type,
    required,
    default_value,
    placeholder,
    unit,
    options,
    order,
    is_active,
  } = req.body;

  try {
    const newAttribute = await Attribute.create({
      categoryID,
      name,
      label,
      data_type,
      required,
      default_value,
      placeholder,
      unit,
      options,
      order,
      is_active,
    });
    res.status(201).json(newAttribute);
  } catch (error) {
    console.error("Error creating attribute:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an attribute by ID
export const updateAttribute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    categoryID,
    name,
    label,
    data_type,
    required,
    default_value,
    placeholder,
    unit,
    options,
    order,
    is_active,
  } = req.body;

  try {
    const attribute = await Attribute.findByPk(id);

    if (!attribute) {
      res.status(404).json({ message: "Attribute not found" });
      return;
    }

    await attribute.update({
      categoryID,
      name,
      label,
      data_type,
      required,
      default_value,
      placeholder,
      unit,
      options,
      order,
      is_active,
    });

    res
      .status(200)
      .json({ message: "Attribute updated successfully", attribute });
  } catch (error) {
    console.error("Error updating attribute:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE an attribute by ID
export const deleteAttribute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const attribute = await Attribute.findByPk(id);

    if (!attribute) {
      res.status(404).json({ message: "Attribute not found" });
      return;
    }

    // Delete the attribute
    await attribute.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting attribute:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
