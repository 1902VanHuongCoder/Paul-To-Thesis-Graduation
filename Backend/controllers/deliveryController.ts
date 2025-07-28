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
      res.status(404).json({ message: "Phương thức giao hàng không tồn tại" });
    } else {
      await delivery.destroy();
      res
        .status(200)
        .json({ message: "Phương thức giao hàng đã được xóa thành công." });
    }
  } catch (error: any) {
    console.error("Error deleting delivery method:", error);
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message:
          "Không thể xóa phương thức giao hàng vì thông tin của nó đang được sử dụng trong đơn hàng. Vui lòng xóa hoặc cập nhật các đơn hàng liên quan trước.",
      });
    } else {
      res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xóa phương thức giao hàng. Hãy thử lại." });
    }
  }
};
