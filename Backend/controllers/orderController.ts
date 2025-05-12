import { Request, Response } from "express";
import { Order, User, Product, OrderProduct } from "../models";

// GET all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: "user" },
        { model: Product, as: "products", through: { attributes: ["quantity", "price"] } },
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: "user" },
        { model: Product, as: "products", through: { attributes: ["quantity", "price"] } },
      ],
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { userID, orderDate, total, totalAmount, note, orderStatus, products } = req.body;

  try {
    // Create the order
    const newOrder = await Order.create({
      userID,
      orderDate,
      total,
      totalAmount,
      note,
      orderStatus,
    });

    // Handle products associated with the order
    if (products && Array.isArray(products)) {
      const orderProducts = products.map((product: { productID: number; quantity: number; price: number }) => ({
        orderID: newOrder.orderID,
        productID: product.productID,
        quantity: product.quantity,
        price: product.price,
      }));

      await OrderProduct.bulkCreate(orderProducts);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing order by ID
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userID, orderDate, total, totalAmount, note, orderStatus, products } = req.body;

  try {
    const order = await Order.findByPk(id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Update the order
    await order.update({
      userID,
      orderDate,
      total,
      totalAmount,
      note,
      orderStatus,
    });

    // Handle products associated with the order
    if (products && Array.isArray(products)) {
      // Delete existing product associations
      await OrderProduct.destroy({ where: { orderID: id } });

      // Add updated product associations
      const orderProducts = products.map((product: { productID: number; quantity: number; price: number }) => ({
        orderID: id,
        productID: product.productID,
        quantity: product.quantity,
        price: product.price,
      }));

      await OrderProduct.bulkCreate(orderProducts);
    }

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE an order by ID
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const order = await Order.findByPk(id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Delete associated products
    await OrderProduct.destroy({ where: { orderID: id } });

    // Delete the order
    await order.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};