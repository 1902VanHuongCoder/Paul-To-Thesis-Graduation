import { Request, Response } from "express";
import Delivery from "../models/Delivery";

// GET all delivery methods
export const getAllDeliveryMethods = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deliveries = await Delivery.findAll();
    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Error fetching delivery methods:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a delivery method by ID
export const getDeliveryMethodById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { deliveryID } = req.params;
  try {
    const delivery = await Delivery.findByPk(deliveryID);
    if (!delivery) {
      res.status(404).json({ message: "Delivery method not found" });
    } else {
      res.status(200).json(delivery);
    }
  } catch (error) {
    console.error("Error fetching delivery method:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// CREATE a new delivery method
export const createDeliveryMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json(delivery);
  } catch (error) {
    console.error("Error creating delivery method:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// UPDATE a delivery method
export const updateDeliveryMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { deliveryID } = req.params;
  try {
    const delivery = await Delivery.findByPk(deliveryID);
    if (!delivery) {
      res.status(404).json({ message: "Delivery method not found" });
    } else {
      await delivery.update(req.body);
      res.status(200).json(delivery);
    }
  } catch (error) {
    console.error("Error updating delivery method:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a delivery method
export const deleteDeliveryMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { deliveryID } = req.params;
  try {
    const delivery = await Delivery.findByPk(deliveryID);
    if (!delivery) {
      res.status(404).json({ message: "Delivery method not found" });
    } else {
      await delivery.destroy();
      res.status(204).send();
    }
  } catch (error) {
    console.error("Error deleting delivery method:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
