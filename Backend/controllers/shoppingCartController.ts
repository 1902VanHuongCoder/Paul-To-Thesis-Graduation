import { Request, Response } from "express";
import { ShoppingCart, CartItem, Product } from "../models";

// GET all shopping carts
export const getAllShoppingCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const carts = await ShoppingCart.findAll({
      include: [{ model: Product, as: "products", through: { attributes: ["quantity", "price"] } }],
    });
    res.status(200).json(carts);
  } catch (error) {
    console.error("Error fetching shopping carts:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific shopping cart by ID
export const getShoppingCartById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const cart = await ShoppingCart.findByPk(id, {
      include: [{ model: Product, as: "products", through: { attributes: ["quantity", "price"] } }],
    });

    if (!cart) {
      res.status(404).json({ message: "Shopping cart not found" });
      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching shopping cart by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new shopping cart
export const createShoppingCart = async (req: Request, res: Response): Promise<void> => {
  const { customerID, totalQuantity, payment, discount, products } = req.body;

  try {
    // Create the shopping cart
    const newCart = await ShoppingCart.create({
      customerID,
      totalQuantity,
      payment,
      discount,
    });

    // Handle products associated with the cart
    if (products && Array.isArray(products)) {
      const cartItems = products.map((product: { productID: number; quantity: number; price: number }) => ({
        cartID: newCart.cartID,
        productID: product.productID,
        quantity: product.quantity,
        price: product.price,
      }));

      await CartItem.bulkCreate(cartItems);
    }

    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error creating shopping cart:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing shopping cart by ID
export const updateShoppingCart = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { totalQuantity, payment, discount, products } = req.body;

  try {
    const cart = await ShoppingCart.findByPk(id);

    if (!cart) {
      res.status(404).json({ message: "Shopping cart not found" });
      return;
    }

    // Update the shopping cart
    await cart.update({
      totalQuantity,
      payment,
      discount,
    });

    // Handle products associated with the cart
    if (products && Array.isArray(products)) {
      // Delete existing product associations
      await CartItem.destroy({ where: { cartID: id } });

      // Add updated product associations
      const cartItems = products.map((product: { productID: number; quantity: number; price: number }) => ({
        cartID: id,
        productID: product.productID,
        quantity: product.quantity,
        price: product.price,
      }));

      await CartItem.bulkCreate(cartItems);
    }

    res.status(200).json({ message: "Shopping cart updated successfully", cart });
  } catch (error) {
    console.error("Error updating shopping cart:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a shopping cart by ID
export const deleteShoppingCart = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const cart = await ShoppingCart.findByPk(id);

    if (!cart) {
      res.status(404).json({ message: "Shopping cart not found" });
      return;
    }

    // Delete associated cart items
    await CartItem.destroy({ where: { cartID: id } });

    // Delete the shopping cart
    await cart.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting shopping cart:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};