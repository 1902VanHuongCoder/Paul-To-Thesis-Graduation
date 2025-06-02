import { Request, Response } from "express";
import ShippingAddress from "../models/ShippingAddress";

// Create a new shipping address
export const createShippingAddress = async (req: Request, res: Response) => {
  const { address, phone, isDefault } = req.body;
  try {
    const newAddress = await ShippingAddress.create({
      address,
      phone,
      isDefault: isDefault ?? true,
    });
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all shipping addresses
export const getAllShippingAddresses = async (_req: Request, res: Response) => {
  try {
    const addresses = await ShippingAddress.findAll();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a shipping address by ID
export const getShippingAddressById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const address = await ShippingAddress.findByPk(id);
    if (!address) {
      res.status(404).json({ message: "Shipping address not found" });
    } else {
      res.status(200).json(address);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a shipping address by ID
export const updateShippingAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { address, phone, isDefault } = req.body;
  try {
    const shippingAddress = await ShippingAddress.findByPk(id);
    if (!shippingAddress) {
      res.status(404).json({ message: "Shipping address not found" });
    } else {
      await shippingAddress.update({ address, phone, isDefault });
      res.status(200).json(shippingAddress);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete a shipping address by ID
export const deleteShippingAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const shippingAddress = await ShippingAddress.findByPk(id);
    if (!shippingAddress) {
      res.status(404).json({ message: "Shipping address not found" });
    } else {
      await shippingAddress.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
