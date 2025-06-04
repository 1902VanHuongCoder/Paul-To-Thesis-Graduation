import { Request, Response } from "express";
import ShippingAddress from "../models/ShippingAddress";

// Create a new shipping address
export const createShippingAddress = async (req: Request, res: Response) => {
  const { userID, address, phone, isDefault } = req.body;
  try {
    if (isDefault) {
      const addressIsDefault = await ShippingAddress.findOne({
        where: { userID, isDefault: true },
      });
      if (addressIsDefault) {
        await addressIsDefault.update({
          isDefault: false,
        });
      }
    }

    const newAddress = await ShippingAddress.create({
      userID,
      address,
      phone,
      isDefault: isDefault,
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
  const { shippingAddressID } = req.params;
  const { address, phone, isDefault } = req.body;
  try {
    const shippingAddress = await ShippingAddress.findByPk(shippingAddressID);
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

// Update shipping address status (default of not)
export const updateShippingAddressStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shippingAddressID, userID } = req.params;

  if (!shippingAddressID) {
    res
      .status(400)
      .json({ message: "Shipping address ID haven't been provided." });
  }

  if (!userID) {
    res.status(400).json({ message: "User ID haven't been provided." });
  }
  try {
    const shippingAddresses = ShippingAddress.findAll({
      where: { userID: userID },
    });

    if (shippingAddresses) {
      (await shippingAddresses).forEach(async (address) => {
        if (address.shippingAddressID !== parseInt(shippingAddressID)) {
          await address.update({ isDefault: false });
        } else {
          await address.update({ isDefault: true });
        }
      });
    }
    res.status(200).json({ message: "Update shipping address successfully" });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: new Error().message });
  }
};

// Delete a shipping address by ID
export const deleteShippingAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { shippingAddressID, userID } = req.params;
  try {
    const shippingAddress = await ShippingAddress.findByPk(shippingAddressID);
    if (!shippingAddress) {
      res.status(404).json({ message: "Shipping address not found" });
    } else {
      if (shippingAddress.isDefault) {
        // find other address to set to true
        const otherAddress = await ShippingAddress.findOne({
          where: { userID, isDefault: false },
        });
        if (otherAddress) {
          await otherAddress.update({ isDefault: true });
        }
      }
      await shippingAddress.destroy();
      res.status(204).send({ message: "Delete shipping address successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get shipping addresses by user ID
export const getShippingAddressByUserID = async (
  req: Request,
  res: Response
) => {
  const { userID } = req.params;
  try {
    const addresses = await ShippingAddress.findAll({
      where: { userID },
    });
    if (addresses.length === 0) {
      res
        .status(404)
        .json({ message: "No shipping addresses found for this user" });
    } else {
      res.status(200).json(addresses);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
