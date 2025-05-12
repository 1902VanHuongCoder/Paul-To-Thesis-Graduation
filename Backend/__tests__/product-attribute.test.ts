import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { ProductAttribute, Product, Attribute } from "../models";

jest.mock("../models");

describe("Product Attribute Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/product-attributes", () => {
    it("should return all product attributes", async () => {
      const mockProductAttributes = [
        {
          id: 1,
          productID: 1,
          attributeID: 1,
          value: "Value 1",
          Product: { productID: 1, productName: "Product 1" },
          Attribute: { id: 1, attributeName: "Attribute 1" },
        },
        {
          id: 2,
          productID: 2,
          attributeID: 2,
          value: "Value 2",
          Product: { productID: 2, productName: "Product 2" },
          Attribute: { id: 2, attributeName: "Attribute 2" },
        },
      ];
      jest.spyOn(ProductAttribute, "findAll").mockResolvedValue(mockProductAttributes as any);

      const response = await request(app).get("/api/product-attributes");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProductAttributes);
    });

    it("should handle errors when fetching product attributes", async () => {
      jest.spyOn(ProductAttribute, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/product-attributes");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/product-attributes/:id", () => {
    it("should return a product attribute by ID", async () => {
      const mockProductAttribute = {
        id: 1,
        productID: 1,
        attributeID: 1,
        value: "Value 1",
        Product: { productID: 1, productName: "Product 1" },
        Attribute: { id: 1, attributeName: "Attribute 1" },
      };
      jest.spyOn(ProductAttribute, "findByPk").mockResolvedValue(mockProductAttribute as any);

      const response = await request(app).get("/api/product-attributes/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProductAttribute);
    });

    it("should return 404 if product attribute is not found", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/product-attributes/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product attribute not found");
    });

    it("should handle errors when fetching a product attribute by ID", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/product-attributes/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/product-attributes", () => {
    it("should create a new product attribute", async () => {
      const mockProductAttribute = {
        id: 1,
        productID: 1,
        attributeID: 1,
        value: "New Value",
      };
      jest.spyOn(ProductAttribute, "create").mockResolvedValue(mockProductAttribute as any);

      const response = await request(app)
        .post("/api/product-attributes")
        .send({ productID: 1, attributeID: 1, value: "New Value" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProductAttribute);
    });

    it("should handle errors when creating a product attribute", async () => {
      jest.spyOn(ProductAttribute, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/product-attributes")
        .send({ productID: 1, attributeID: 1, value: "New Value" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/product-attributes/:id", () => {
    it("should update an existing product attribute", async () => {
      const mockProductAttribute = {
        id: 1,
        productID: 1,
        attributeID: 1,
        value: "Updated Value",
      };
      jest.spyOn(ProductAttribute, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockProductAttribute),
      } as any);

      const response = await request(app)
        .put("/api/product-attributes/1")
        .send({ productID: 1, attributeID: 1, value: "Updated Value" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product attribute updated successfully");
    });

    it("should return 404 if product attribute is not found", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/product-attributes/999").send({
        productID: 1,
        attributeID: 1,
        value: "Updated Value",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product attribute not found");
    });

    it("should handle errors when updating a product attribute", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/product-attributes/1").send({
        productID: 1,
        attributeID: 1,
        value: "Updated Value",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/product-attributes/:id", () => {
    it("should delete a product attribute", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/product-attributes/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if product attribute is not found", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/product-attributes/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product attribute not found");
    });

    it("should handle errors when deleting a product attribute", async () => {
      jest.spyOn(ProductAttribute, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/product-attributes/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});