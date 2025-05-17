import { Request, Response } from "express";
import {  Product, Tag } from "../models";

// GET all tags
export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.findAll({
      include: [Product], // Include associated products
    });
    res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a tag by ID
export const getTagById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tag = await Tag.findByPk(id, {
      include: [Product], // Include associated products
    });

    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error("Error fetching tag by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new tag
export const createTag = async (req: Request, res: Response): Promise<void> => {
  const { tagID, tagName, createdAt, updatedAt } = req.body;

  try {
    const newTag = await Tag.create({ tagID, tagName, createdAt, updatedAt });
    res.status(201).json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) a tag by ID
export const updateTag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { tagName } = req.body;

  try {
    const tag = await Tag.findByPk(id);

    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }

    await tag.update({ tagName });
    res.status(200).json({ message: "Tag updated successfully", tag });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a tag by ID
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const tag = await Tag.findByPk(id);

    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }

    // Delete the tag
    await tag.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};