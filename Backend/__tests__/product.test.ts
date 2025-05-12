import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Product, ProductTag, ProductAttribute } from "../models";

jest.mock("../models");

describe("Product Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /products", () => {
    it("should return all products", async () => {
      const mockProducts = [
        { productID: 1, productName: "Product 1" },
        { productID: 2, productName: "Product 2" },
      ];
      jest.spyOn(Product, "findAll").mockResolvedValue(mockProducts as any);

      const response = await request(app).get("/api/product");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });

    it("should handle errors when fetching products", async () => {
      jest.spyOn(Product, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/product");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /products/:id", () => {
    it("should return a product by ID", async () => {
      const mockProduct = { productID: 1, productName: "Product 1" };
      jest.spyOn(Product, "findByPk").mockResolvedValue(mockProduct as any);

      const response = await request(app).get("/api/product/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it("should return 404 if product is not found", async () => {
      jest.spyOn(Product, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/product/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });

    it("should handle errors when fetching a product by ID", async () => {
      jest.spyOn(Product, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/product/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const mockProduct = { productID: 1, productName: "New Product" };
      jest.spyOn(Product, "create").mockResolvedValue(mockProduct as any);
      jest.spyOn(ProductTag, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(ProductAttribute, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .post("/api/product")
        .send({
          productName: "New Product",
          productPrice: 100,
          quantityAvailable: 10,
          categoryID: 1,
          tagIDs: [1, 2],
          originID: 1,
          subcategoryID: 1,
          images: "image.jpg",
          attributes: [{ attributeID: 1, value: "Value 1" }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
    });

    it("should handle errors when creating a product", async () => {
      jest.spyOn(Product, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/product")
        .send({
          productName: "New Product",
          productPrice: 100,
          quantityAvailable: 10,
          categoryID: 1,
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /products/:id", () => {
    it("should update an existing product", async () => {
      const mockProduct = { productID: 1, productName: "Updated Product" };
      jest.spyOn(Product, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockProduct),
      } as any);
      jest.spyOn(ProductTag, "destroy").mockResolvedValue(1);
      jest.spyOn(ProductTag, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(ProductAttribute, "destroy").mockResolvedValue(1);
      jest.spyOn(ProductAttribute, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .put("/api/product/1")
        .send({
          productName: "Updated Product",
          productPrice: 150,
          quantityAvailable: 5,
          tagIDs: [1, 3],
          attributes: [{ attributeID: 2, value: "Updated Value" }],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product updated successfully");
    });

    it("should return 404 if product is not found", async () => {
      jest.spyOn(Product, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/product/999").send({
        productName: "Updated Product",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });

    it("should handle errors when updating a product", async () => {
      jest.spyOn(Product, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/product/1").send({
        productName: "Updated Product",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product", async () => {
      jest.spyOn(Product, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);
      jest.spyOn(ProductTag, "destroy").mockResolvedValue(1);
      jest.spyOn(ProductAttribute, "destroy").mockResolvedValue(1);

      const response = await request(app).delete("/api/product/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if product is not found", async () => {
      jest.spyOn(Product, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/product/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });

    it("should handle errors when deleting a product", async () => {
      jest.spyOn(Product, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/product/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});