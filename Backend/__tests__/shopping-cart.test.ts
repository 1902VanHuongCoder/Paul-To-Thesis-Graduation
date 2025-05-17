import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { ShoppingCart, CartItem, Product } from "../models";

jest.mock("../models");

describe("Shopping Cart Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/shopping-cart", () => {
    it("should return all shopping carts", async () => {
      const mockCarts = [
        {
          cartID: 1,
          customerID: 1,
          totalQuantity: 5,
          payment: 100,
          discount: 10,
          products: [
            { id: 1, productName: "Product 1", CartItem: { quantity: 2, price: 50 } },
          ],
        },
        {
          cartID: 2,
          customerID: 2,
          totalQuantity: 3,
          payment: 60,
          discount: 5,
          products: [
            { id: 2, productName: "Product 2", CartItem: { quantity: 3, price: 20 } },
          ],
        },
      ];
      jest.spyOn(ShoppingCart, "findAll").mockResolvedValue(mockCarts as any);

      const response = await request(app).get("/api/shopping-cart");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCarts);
    });

    it("should handle errors when fetching shopping carts", async () => {
      jest.spyOn(ShoppingCart, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/shopping-cart");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/shopping-cart/:id", () => {
    it("should return a shopping cart by ID", async () => {
      const mockCart = {
        cartID: 1,
        customerID: 1,
        totalQuantity: 5,
        payment: 100,
        discount: 10,
        products: [
          { id: 1, productName: "Product 1", CartItem: { quantity: 2, price: 50 } },
        ],
      };
      jest.spyOn(ShoppingCart, "findByPk").mockResolvedValue(mockCart as any);

      const response = await request(app).get("/api/shopping-cart/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCart);
    });

    it("should return 404 if shopping cart is not found", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/shopping-cart/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Shopping cart not found");
    });

    it("should handle errors when fetching a shopping cart by ID", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/shopping-cart/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/shopping-cart", () => {
    it("should create a new shopping cart", async () => {
      const mockCart = {
        cartID: 1,
        customerID: 1,
        totalQuantity: 5,
        payment: 100,
        discount: 10,
      };
      jest.spyOn(ShoppingCart, "create").mockResolvedValue(mockCart as any);
      jest.spyOn(CartItem, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .post("/api/shopping-cart")
        .send({
          customerID: 1,
          totalQuantity: 5,
          payment: 100,
          discount: 10,
          products: [{ productID: 1, quantity: 2, price: 50 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCart);
    });

    it("should handle errors when creating a shopping cart", async () => {
      jest.spyOn(ShoppingCart, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/shopping-cart")
        .send({
          customerID: 1,
          totalQuantity: 5,
          payment: 100,
          discount: 10,
          products: [{ productID: 1, quantity: 2, price: 50 }],
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/shopping-cart/:id", () => {
    it("should update an existing shopping cart", async () => {
      const mockCart = {
        cartID: 1,
        customerID: 1,
        totalQuantity: 6,
        payment: 120,
        discount: 15,
      };
      jest.spyOn(ShoppingCart, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockCart),
      } as any);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(1);
      jest.spyOn(CartItem, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .put("/api/shopping-cart/1")
        .send({
          totalQuantity: 6,
          payment: 120,
          discount: 15,
          products: [{ productID: 1, quantity: 3, price: 40 }],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Shopping cart updated successfully");
    });

    it("should return 404 if shopping cart is not found", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/shopping-cart/999").send({
        totalQuantity: 6,
        payment: 120,
        discount: 15,
        products: [{ productID: 1, quantity: 3, price: 40 }],
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Shopping cart not found");
    });

    it("should handle errors when updating a shopping cart", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/shopping-cart/1").send({
        totalQuantity: 6,
        payment: 120,
        discount: 15,
        products: [{ productID: 1, quantity: 3, price: 40 }],
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/shopping-cart/:id", () => {
    it("should delete a shopping cart", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(1);

      const response = await request(app).delete("/api/shopping-cart/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if shopping cart is not found", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/shopping-cart/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Shopping cart not found");
    });

    it("should handle errors when deleting a shopping cart", async () => {
      jest.spyOn(ShoppingCart, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/shopping-cart/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});