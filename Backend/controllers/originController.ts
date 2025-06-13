import { Request, Response } from "express";
import { Origin, Product } from "../models";

// GET all origins
export const getAllOrigins = async (req: Request, res: Response): Promise<void> => {
  try {
    const origins = await Origin.findAll();
    res.status(200).json(origins);
  } catch (error) {
    console.error("Error fetching origins:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET an origin by ID
export const getOriginById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const origin = await Origin.findByPk(id);

    if (!origin) {
      res.status(404).json({ message: "Origin not found" });
      return;
    }

    res.status(200).json(origin);
  } catch (error) {
    console.error("Error fetching origin by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new origin
export const createOrigin = async (req: Request, res: Response): Promise<void> => {
  const { originID, originName, originImage, createdAt, updatedAt } = req.body;

  try {
    const newOrigin = await Origin.create({
      originID,
      originName,
      originImage,
      createdAt,
      updatedAt,
    });
    res.status(201).json(newOrigin);
  } catch (error) {
    console.error("Error creating origin:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an origin by ID
export const updateOrigin = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { originName, originImage } = req.body;

  try {
    const origin = await Origin.findByPk(id);

    if (!origin) {
      res.status(404).json({ message: "Origin not found" });
      return;
    }
    await origin.update({ originName, originImage });
    res.status(200).json({ message: "Origin updated successfully", origin });
  } catch (error) {
    console.error("Error updating origin:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE an origin by ID
export const deleteOrigin = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const origin = await Origin.findByPk(id);

    if (!origin) {
      res.status(404).json({ message: "Origin not found" });
      return;
    }

    // Delete the origin
    await origin.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting origin:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};