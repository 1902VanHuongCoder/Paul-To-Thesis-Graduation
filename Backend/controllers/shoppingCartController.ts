import { Request, Response } from "express";
import { ShoppingCart, CartItem, Product } from "../models";

// GET all shopping carts
export const getAllShoppingCarts = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Fetching all shopping carts...");
  try {
    const carts = await ShoppingCart.findAll({
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "price", "discount"] },
        },
      ],
    });
    res.status(200).json(carts);
  } catch (error) {
    console.error("Error fetching shopping carts:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific shopping cart by ID
export const getShoppingCartById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { customerID } = req.params;

  try {
    const cart = await ShoppingCart.findOne({
      where: { customerID },
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "price", "discount"] },
        },
      ],
    });

    if (!cart) {
      res.status(200).json({ message: "Người dùng chưa thêm sản phẩm nào vào giỏ hàng" });
      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching shopping cart by customerID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createShoppingCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { customerID , productID, quantity } = req.body;

  try {
    // Check if a shopping cart already exists for the customer
    let cart = await ShoppingCart.findOne({ where: { customerID } });

    // If not, create a new shopping cart
    if (!cart) {
      cart = await ShoppingCart.create({ customerID, totalQuantity: 1 });
    } else {
      // If exists, increase totalQuantity by 1
      cart.totalQuantity += 1;
      await cart.save();
    }

    // Get product price
    const product = await Product.findByPk(productID);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Check if the product is already in the cart
    let cartItem = await CartItem.findOne({
      where: { cartID: cart.cartID, productID },
    });

    if (cartItem) {
      // If exists, update the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // If not, create a new cart item
      cartItem = await CartItem.create({
        cartID: cart.cartID,
        productID,
        quantity,
        discount: 0,
        price: product.productPrice,
      });
    }

    res.status(201).json({
      message: "Product added to cart successfully",
      cart,
      cartItem,
    });
  } catch (error) {
    console.error("Error creating shopping cart:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCartItemQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cartID, productID } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await CartItem.findOne({ where: { cartID, productID } });
    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ message: "Cart item quantity updated", cartItem });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const removeProductFromCart = async (req: Request, res: Response) => {
  const { cartID, productID } = req.params;
  try {
    const deleted = await CartItem.destroy({ where: { cartID, productID } });
    if (deleted) {
      res.status(200).json({ message: "Product removed from cart" });
    } else {
      res.status(404).json({ message: "Cart item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteAllShoppingCartBelongsToCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { customerID } = req.params;
  try {
    // Find all carts for this customer
    const carts = await ShoppingCart.findAll({ where: { customerID } });
    if (!carts.length) {
      res
        .status(404)
        .json({ message: "No shopping cart found for this customer" });
    }
    // Delete all cart items for these carts
    for (const cart of carts) {
      await CartItem.destroy({ where: { cartID: cart.cartID } });
      await cart.destroy();
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting shopping cart(s):", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
