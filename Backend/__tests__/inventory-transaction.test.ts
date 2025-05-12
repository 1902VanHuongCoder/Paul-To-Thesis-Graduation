import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { InventoryTransaction, Inventory } from "../models";

jest.mock("../models");

describe("Inventory Transaction Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/inventory-transaction", () => {
    it("should return all inventory transactions", async () => {
      const mockTransactions = [
        {
          id: 1,
          inventoryID: 1,
          quantityChange: 10,
          transactionType: "ADD",
          note: "Added stock",
          performedBy: "Admin",
          inventory: { id: 1, productID: 1, quantityInStock: 100 },
        },
        {
          id: 2,
          inventoryID: 2,
          quantityChange: -5,
          transactionType: "REMOVE",
          note: "Removed stock",
          performedBy: "Admin",
          inventory: { id: 2, productID: 2, quantityInStock: 50 },
        },
      ];
      jest.spyOn(InventoryTransaction, "findAll").mockResolvedValue(mockTransactions as any);

      const response = await request(app).get("/api/inventory-transaction");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransactions);
    });

    it("should handle errors when fetching inventory transactions", async () => {
      jest.spyOn(InventoryTransaction, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/inventory-transaction");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/inventory-transaction/:id", () => {
    it("should return an inventory transaction by ID", async () => {
      const mockTransaction = {
        id: 1,
        inventoryID: 1,
        quantityChange: 10,
        transactionType: "ADD",
        note: "Added stock",
        performedBy: "Admin",
        inventory: { id: 1, productID: 1, quantityInStock: 100 },
      };
      jest.spyOn(InventoryTransaction, "findByPk").mockResolvedValue(mockTransaction as any);

      const response = await request(app).get("/api/inventory-transaction/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransaction);
    });

    it("should return 404 if inventory transaction is not found", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/inventory-transaction/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inventory transaction not found");
    });

    it("should handle errors when fetching an inventory transaction by ID", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/inventory-transaction/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/inventory-transaction", () => {
    it("should create a new inventory transaction", async () => {
      const mockTransaction = {
        id: 1,
        inventoryID: 1,
        quantityChange: 10,
        transactionType: "ADD",
        note: "Added stock",
        performedBy: "Admin",
      };
      jest.spyOn(InventoryTransaction, "create").mockResolvedValue(mockTransaction as any);

      const response = await request(app)
        .post("/api/inventory-transaction")
        .send({
          inventoryID: 1,
          quantityChange: 10,
          transactionType: "ADD",
          note: "Added stock",
          performedBy: "Admin",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTransaction);
    });

    it("should handle errors when creating an inventory transaction", async () => {
      jest.spyOn(InventoryTransaction, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/inventory-transaction")
        .send({
          inventoryID: 1,
          quantityChange: 10,
          transactionType: "ADD",
          note: "Added stock",
          performedBy: "Admin",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/inventory-transaction/:id", () => {
    it("should update an existing inventory transaction", async () => {
      const mockTransaction = {
        id: 1,
        inventoryID: 1,
        quantityChange: 15,
        transactionType: "ADD",
        note: "Updated stock",
        performedBy: "Admin",
      };
      jest.spyOn(InventoryTransaction, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockTransaction),
      } as any);

      const response = await request(app)
        .put("/api/inventory-transaction/1")
        .send({
          inventoryID: 1,
          quantityChange: 15,
          transactionType: "ADD",
          note: "Updated stock",
          performedBy: "Admin",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Inventory transaction updated successfully");
    });

    it("should return 404 if inventory transaction is not found", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/inventory-transaction/999").send({
        inventoryID: 1,
        quantityChange: 15,
        transactionType: "ADD",
        note: "Updated stock",
        performedBy: "Admin",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inventory transaction not found");
    });

    it("should handle errors when updating an inventory transaction", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/inventory-transaction/1").send({
        inventoryID: 1,
        quantityChange: 15,
        transactionType: "ADD",
        note: "Updated stock",
        performedBy: "Admin",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/inventory-transaction/:id", () => {
    it("should delete an inventory transaction", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/inventory-transaction/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if inventory transaction is not found", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/inventory-transaction/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inventory transaction not found");
    });

    it("should handle errors when deleting an inventory transaction", async () => {
      jest.spyOn(InventoryTransaction, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/inventory-transaction/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});