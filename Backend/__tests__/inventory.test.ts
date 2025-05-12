import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Inventory, Product, Location } from "../models";

jest.mock("../models");

describe("Inventory Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/inventory", () => {
    it("should return all inventory records", async () => {
      const mockInventories = [
        {
          id: 1,
          productID: 1,
          locationID: 1,
          quantityInStock: 100,
          product: { productName: "Product 1" },
          location: { locationName: "Location 1" },
        },
        {
          id: 2,
          productID: 2,
          locationID: 2,
          quantityInStock: 50,
          product: { productName: "Product 2" },
          location: { locationName: "Location 2" },
        },
      ];
      jest.spyOn(Inventory, "findAll").mockResolvedValue(mockInventories as any);

      const response = await request(app).get("/api/inventory");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInventories);
    });

    it("should handle errors when fetching inventory records", async () => {
      jest.spyOn(Inventory, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/inventory");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/inventory/:id", () => {
    it("should return an inventory record by ID", async () => {
      const mockInventory = {
        id: 1,
        productID: 1,
        locationID: 1,
        quantityInStock: 100,
        product: { productName: "Product 1" },
        location: { locationName: "Location 1" },
      };
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(mockInventory as any);

      const response = await request(app).get("/api/inventory/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInventory);
    });

    it("should return 404 if inventory record is not found", async () => {
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/inventory/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inventory record not found");
    });

    it("should handle errors when fetching an inventory record by ID", async () => {
      jest.spyOn(Inventory, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/inventory/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/inventory", () => {
    it("should create a new inventory record", async () => {
      const mockInventory = {
        id: 1,
        productID: 1,
        locationID: 1,
        quantityInStock: 100,
      };
      jest.spyOn(Inventory, "create").mockResolvedValue(mockInventory as any);

      const response = await request(app)
        .post("/api/inventory")
        .send({ productID: 1, locationID: 1, quantityInStock: 100 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockInventory);
    });

    it("should handle errors when creating an inventory record", async () => {
      jest.spyOn(Inventory, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/inventory")
        .send({ productID: 1, locationID: 1, quantityInStock: 100 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/inventory/:id", () => {
    it("should update an existing inventory record", async () => {
      const mockInventory = {
        id: 1,
        productID: 1,
        locationID: 1,
        quantityInStock: 150,
      };
      jest.spyOn(Inventory, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockInventory),
      } as any);

      const response = await request(app)
        .put("/api/inventory/1")
        .send({ productID: 1, locationID: 1, quantityInStock: 150 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Inventory updated successfully");
    });

    it("should return 404 if inventory record is not found", async () => {
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/inventory/999").send({
        productID: 1,
        locationID: 1,
        quantityInStock: 150,
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inventory record not found");
    });

    it("should handle errors when updating an inventory record", async () => {
      jest.spyOn(Inventory, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/inventory/1").send({
        productID: 1,
        locationID: 1,
        quantityInStock: 150,
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/inventory/:id", () => {
    it("should delete an inventory record", async () => {
      jest.spyOn(Inventory, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/inventory/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if inventory record is not found", async () => {
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/inventory/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inventory record not found");
    });

    it("should handle errors when deleting an inventory record", async () => {
      jest.spyOn(Inventory, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/inventory/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});