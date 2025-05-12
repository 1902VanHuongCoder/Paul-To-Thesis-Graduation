import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Category, Product, SubCategory } from "../models";

jest.mock("../models");

describe("Category Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /categories", () => {
    it("should return all categories", async () => {
      const mockCategories = [
        { categoryID: 1, categoryName: "Category 1", Products: [], SubCategories: [] },
        { categoryID: 2, categoryName: "Category 2", Products: [], SubCategories: [] },
      ];
      jest.spyOn(Category, "findAll").mockResolvedValue(mockCategories as any);

      const response = await request(app).get("/api/category");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategories);
    });

    it("should handle errors when fetching categories", async () => {
      jest.spyOn(Category, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/category");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /categories/:id", () => {
    it("should return a category by ID", async () => {
      const mockCategory = {
        categoryID: 1,
        categoryName: "Category 1",
        Products: [],
        SubCategories: [],
      };
      jest.spyOn(Category, "findByPk").mockResolvedValue(mockCategory as any);

      const response = await request(app).get("/api/category/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategory);
    });

    it("should return 404 if category is not found", async () => {
      jest.spyOn(Category, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/category/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Category not found");
    });

    it("should handle errors when fetching a category by ID", async () => {
      jest.spyOn(Category, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/category/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /categories", () => {
    it("should create a new category", async () => {
      const mockCategory = { categoryID: 1, categoryName: "New Category" };
      jest.spyOn(Category, "create").mockResolvedValue(mockCategory as any);

      const response = await request(app)
        .post("/api/category")
        .send({ categoryName: "New Category" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCategory);
    });

    it("should handle errors when creating a category", async () => {
      jest.spyOn(Category, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/category")
        .send({ categoryName: "New Category" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /categories/:id", () => {
    it("should update an existing category", async () => {
      const mockCategory = { categoryID: 1, categoryName: "Updated Category" };
      jest.spyOn(Category, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockCategory),
      } as any);

      const response = await request(app)
        .put("/api/category/1")
        .send({ categoryName: "Updated Category" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Category updated successfully");
    });

    it("should return 404 if category is not found", async () => {
      jest.spyOn(Category, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/category/999").send({
        categoryName: "Updated Category",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Category not found");
    });

    it("should handle errors when updating a category", async () => {
      jest.spyOn(Category, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/category/1").send({
        categoryName: "Updated Category",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /categories/:id", () => {
    it("should delete a category", async () => {
      jest.spyOn(Category, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/category/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if category is not found", async () => {
      jest.spyOn(Category, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/category/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Category not found");
    });

    it("should handle errors when deleting a category", async () => {
      jest.spyOn(Category, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/category/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});