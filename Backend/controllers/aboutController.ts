import { Request, Response } from "express";
import About from "../models/About";

// Get about info (assume only one row)
export const getAbout = async (_req: Request, res: Response) => {
  try {
    const about = await About.findOne();
    if (!about) {
      res.status(404).json({ message: "About info not found" });
      return;
    }
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Create about info (admin)
export const createAbout = async (req: Request, res: Response) => {
  try {
    const about = await About.create(req.body);
    res.status(201).json(about);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update about info (admin, by id or just update first row)
export const updateAbout = async (req: Request, res: Response) => {
  try {
    const about = await About.findOne();
    if (!about) {
      res.status(404).json({ message: "About info not found" });
      return;
    }
    await about.update(req.body);
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete about info (admin, rarely used)
export const deleteAbout = async (_req: Request, res: Response) => {
  try {
    const about = await About.findOne();
    if (!about) {
      res.status(404).json({ message: "About info not found" });
      return;
    }
    await about.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
