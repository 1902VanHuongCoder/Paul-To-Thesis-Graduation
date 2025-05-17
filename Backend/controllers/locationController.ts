import { Request, Response } from "express";
import { Location } from "../models";

// GET all locations
export const getAllLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const locations = await Location.findAll();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific location by ID
export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const location = await Location.findByPk(id);

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new location
export const createLocation = async (req: Request, res: Response): Promise<void> => {
  const { locationName, address, hotline } = req.body;

  try {
    const newLocation = await Location.create({
      locationName,
      address,
      hotline,
    });

    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing location by ID
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { locationName, address, hotline } = req.body;

  try {
    const location = await Location.findByPk(id);

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    await location.update({
      locationName,
      address,
      hotline,
    });

    res.status(200).json({ message: "Location updated successfully", location });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a location by ID
export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const location = await Location.findByPk(id);

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    await location.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};