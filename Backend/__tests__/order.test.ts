import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Order, User, Product, OrderProduct } from "../models";

jest.mock("../models");

describe("Order Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/order", () => {
    it("should return all orders", async () => {
      const mockOrders = [
        {
          orderID: 1,
          userID: 1,
          orderDate: "2025-05-12",
          total: 100,
          totalAmount: 120,
          note: "First order",
          orderStatus: "Pending",
          user: { id: 1, username: "John Doe" },
          products: [
            { id: 1, productName: "Product 1", OrderProduct: { quantity: 2, price: 50 } },
          ],
        },
      ];
      jest.spyOn(Order, "findAll").mockResolvedValue(mockOrders as any);

      const response = await request(app).get("/api/order");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
    });

    it("should handle errors when fetching orders", async () => {
      jest.spyOn(Order, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/order");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/order/:id", () => {
    it("should return an order by ID", async () => {
      const mockOrder = {
        orderID: 1,
        userID: 1,
        orderDate: "2025-05-12",
        total: 100,
        totalAmount: 120,
        note: "First order",
        orderStatus: "Pending",
        user: { id: 1, username: "John Doe" },
        products: [
          { id: 1, productName: "Product 1", OrderProduct: { quantity: 2, price: 50 } },
        ],
      };
      jest.spyOn(Order, "findByPk").mockResolvedValue(mockOrder as any);

      const response = await request(app).get("/api/order/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrder);
    });

    it("should return 404 if order is not found", async () => {
      jest.spyOn(Order, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/order/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle errors when fetching an order by ID", async () => {
      jest.spyOn(Order, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/order/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/order", () => {
    it("should create a new order", async () => {
      const mockOrder = {
        orderID: 1,
        userID: 1,
        orderDate: "2025-05-12",
        total: 100,
        totalAmount: 120,
        note: "First order",
        orderStatus: "Pending",
      };
      jest.spyOn(Order, "create").mockResolvedValue(mockOrder as any);
      jest.spyOn(OrderProduct, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .post("/api/order")
        .send({
          userID: 1,
          orderDate: "2025-05-12",
          total: 100,
          totalAmount: 120,
          note: "First order",
          orderStatus: "Pending",
          products: [{ productID: 1, quantity: 2, price: 50 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockOrder);
    });

    it("should handle errors when creating an order", async () => {
      jest.spyOn(Order, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/order")
        .send({
          userID: 1,
          orderDate: "2025-05-12",
          total: 100,
          totalAmount: 120,
          note: "First order",
          orderStatus: "Pending",
          products: [{ productID: 1, quantity: 2, price: 50 }],
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/order/:id", () => {
    it("should update an existing order", async () => {
      const mockOrder = {
        orderID: 1,
        userID: 1,
        orderDate: "2025-05-12",
        total: 150,
        totalAmount: 180,
        note: "Updated order",
        orderStatus: "Completed",
      };
      jest.spyOn(Order, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockOrder),
      } as any);
      jest.spyOn(OrderProduct, "destroy").mockResolvedValue(1);
      jest.spyOn(OrderProduct, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .put("/api/order/1")
        .send({
          userID: 1,
          orderDate: "2025-05-12",
          total: 150,
          totalAmount: 180,
          note: "Updated order",
          orderStatus: "Completed",
          products: [{ productID: 1, quantity: 3, price: 50 }],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Order updated successfully");
    });

    it("should return 404 if order is not found", async () => {
      jest.spyOn(Order, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/order/999").send({
        userID: 1,
        orderDate: "2025-05-12",
        total: 150,
        totalAmount: 180,
        note: "Updated order",
        orderStatus: "Completed",
        products: [{ productID: 1, quantity: 3, price: 50 }],
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle errors when updating an order", async () => {
      jest.spyOn(Order, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/order/1").send({
        userID: 1,
        orderDate: "2025-05-12",
        total: 150,
        totalAmount: 180,
        note: "Updated order",
        orderStatus: "Completed",
        products: [{ productID: 1, quantity: 3, price: 50 }],
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/order/:id", () => {
    it("should delete an order", async () => {
      jest.spyOn(Order, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);
      jest.spyOn(OrderProduct, "destroy").mockResolvedValue(1);

      const response = await request(app).delete("/api/order/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if order is not found", async () => {
      jest.spyOn(Order, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/order/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle errors when deleting an order", async () => {
      jest.spyOn(Order, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/order/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});