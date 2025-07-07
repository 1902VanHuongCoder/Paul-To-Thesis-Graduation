import { Request, Response } from "express";
import {
  Order,
  User,
  Product,
  OrderProduct,
  ShoppingCart,
  CartItem,
  Discount,
  Delivery,
} from "../models";
import { Transaction } from "sequelize";
import { io } from "../server";

// GET all orders
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: "user" },
        { model: Delivery, as: "delivery" },
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "price"] },
        },
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific order by ID
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderID } = req.params;

  try {
    const order = await Order.findByPk(orderID, {
      include: [
        { model: User, as: "user" },
        { model: Delivery, as: "delivery" },
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "price"] },
        },
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

export const getOrdersByUserID = async (req:Request, res: Response) => {
    const { userID } = req.params; 
    try {
       const orders = await Order.findAll({
        where: {userID}
       });
       if(orders.length > 0){
        res.status(200).json(orders);
       }else{
         res.status(404).json({message: "No orders found for this user."}); 
       }
    }catch(error){
        console.error("Error happens when fetching orders by userID:", error); 
        res.status(500).json((new Error).message); 
    }
}

// POST a new order
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    orderID,
    userID,
    fullName,
    phone,
    address,
    paymentMethod,
    cartID,
    deliveryID,
    totalPayment,
    totalQuantity,
    note,
    discount, // {discountID, discountValue}
    deliveryCost,
    status,
  } = req.body;

  const discountValue = req.body.discount?.discountValue || 0;
  const t = await Order.sequelize?.transaction();

  try {
    // 1. Find all cart items for this cartID
    const cartItems = await CartItem.findAll({
      where: { cartID },
      transaction: t,
    });

    if (!cartItems || cartItems.length === 0) {
      await t?.rollback();
      res.status(400).json({ error: "Cart is empty or not found" });
      return;
    } else {
      // 2. Create the order
      const newOrder = await Order.create(
        {
          orderID,
          userID,
          fullName,
          phone,
          address,
          paymentMethod,
          deliveryID,
          totalPayment,
          totalQuantity,
          note,
          discountValue,
          deliveryCost,
          status
        },
        { transaction: t }
      );

      // 3. Add OrderProduct entries for each cart item
      const orderProducts = cartItems.map((item: any) => ({
        orderID: newOrder.orderID,
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
      }));

      await OrderProduct.bulkCreate(orderProducts, { transaction: t });

      // 4. If discount is applied, increase usedCount
      if (discount && discount.discountID) {
        const discountRecord = await Discount.findByPk(discount.discountID, {
          transaction: t,
        });
        if (discountRecord) {
          await discountRecord.increment("usedCount", {
            by: 1,
            transaction: t,
          });
        }
      }

      await CartItem.destroy({
        where: { cartID },
        transaction: t,
      });

      await ShoppingCart.destroy({
        where: { customerID: userID },
        transaction: t,
      });

      await t?.commit();

      // Emit order notification to all admins, this allow them to know that a new order has been created 
      io.emit("order-notification", {
        userName : newOrder.fullName,
        createdAt: newOrder.createdAt,
      });
      
      res.status(201).json(newOrder);
    }
  } catch (error) {
    await t?.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
// PUT (update) an existing order by ID
export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderID } = req.params;
  const {
    userID,
    fullName,
    phone,
    address,
    paymentMethod,
    deliveryMethod,
    cartID,
    totalPayment,
    totalQuantity,
    note,
    discount,
    products,
    orderStatus,
  } = req.body;

  console.log(req.body);

  const t = await Order.sequelize?.transaction();

  try {
    const order = await Order.findByPk(orderID);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Update the order
    await order.update(
      {
        userID,
        fullName,
        phone,
        address,
        paymentMethod,
        deliveryMethod,
        cartID,
        totalPayment,
        totalQuantity,
        note,
        discount,
        // ...order,
        orderStatus,
      },
      { transaction: t }
    );

    // // Handle products associated with the order
    // if (products && Array.isArray(products)) {
    //   // Delete existing product associations
    //   await OrderProduct.destroy({ where: { orderID: id }, transaction: t });

    //   // Add updated product associations
    //   const orderProducts = products.map(
    //     (product: { productID: number; quantity: number; price: number }) => ({
    //       orderID: id,
    //       productID: product.productID,
    //       quantity: product.quantity,
    //       price: product.price,
    //     })
    //   );

    //   await OrderProduct.bulkCreate(orderProducts, { transaction: t });
    // }

    await t?.commit();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    await t?.rollback();
    console.error("Error updating order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE an order by ID
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderID } = req.params;

  const t = await Order.sequelize?.transaction();

  try {
    const order = await Order.findByPk(orderID);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Delete associated products
    await OrderProduct.destroy({ where: { orderID: orderID }, transaction: t });

    // Delete the order
    await order.destroy({ transaction: t });

    await t?.commit();
    res.status(204).send();
  } catch (error) {
    await t?.rollback();
    console.error("Error deleting order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
