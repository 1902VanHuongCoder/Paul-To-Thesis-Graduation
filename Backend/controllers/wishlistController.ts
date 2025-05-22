import { Request, Response } from "express";
import {Product, Wishlist} from "../models";

// GET all wishlists
export const getAllWishlists = async (req: Request, res: Response) => {
  try {
    const wishlists = await Wishlist.findAll({
      include: [{ model: Product, as: "product" }]
    });
    res.status(200).json(wishlists);
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET wishlist by customer ID
export const getWishlistByCustomerId = async (req: Request, res: Response) => {
  const { customerID } = req.params;
  try {
    const wishlist = await Wishlist.findAll({
      where: { customerID },
      include: [{ model: Product, as: "product" }]
    });
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist by customerID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST add product to wishlist
export const addToWishlist = async (req: Request, res: Response) : Promise<void> => {
  const { customerID, productID } = req.body;
  try {
    // Prevent duplicate wishlist entries
    const exists = await Wishlist.findOne({ where: { customerID, productID } });
    if (exists) {
      res.status(409).json({ message: "Product already in wishlist" });
    }
    const wishlist = await Wishlist.create({ customerID, productID });
    res.status(201).json(wishlist);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE remove product from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  const { customerID, productID } = req.body;
  try {
    const deleted = await Wishlist.destroy({ where: { customerID, productID } });
    if (deleted) {
      res.status(200).json({ message: "Product removed from wishlist" });
    } else {
      res.status(404).json({ message: "Wishlist item not found" });
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE clear all wishlist items for a customer
export const clearWishlist = async (req: Request, res: Response) => {
  const { customerID } = req.params;
  try {
    await Wishlist.destroy({ where: { customerID } });
    res.status(200).json({ message: "Wishlist cleared" });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};