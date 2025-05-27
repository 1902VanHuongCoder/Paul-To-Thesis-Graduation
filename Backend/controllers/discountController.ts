import { Request, Response } from "express";
import Discount from "../models/Discount";

// Get all discounts
export const getAllDiscounts = async (req: Request, res: Response) : Promise<void> => {
  try {
    const discounts = await Discount.findAll();
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a discount by ID
export const getDiscountById = async (req: Request, res: Response) : Promise<void> => {
  const { discountID} = req.params; 
  try {
    const discount = await Discount.findByPk(discountID);
    if (!discount) {
      res.status(404).json({ message: "Discount not found" });
    }else {
       res.status(200).json({message:"Discount code is valid", discount});
    }
   
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Create a new discount
export const createDiscount = async (req: Request, res: Response) : Promise<void> => {
  console.log("Creating discount with body:", req.body);
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json({message: "Add discount successfully", data: discount});
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a discount
export const updateDiscount = async (req: Request, res: Response) : Promise<void> => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) {
       res.status(404).json({ message: "Discount not found" });
    }else{
        await discount.update(req.body);
    }
  
    res.status(200).json(discount);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete a discount
export const deleteDiscount = async (req: Request, res: Response) : Promise<void> => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) {
     res.status(404).json({ message: "Discount not found" });
    }else{
       await discount.destroy();
    }
   
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};