import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { SubCategory, Category } from "../models";

jest.mock("../models");

describe("SubCategory Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /subcategories", () => {
    it("should return all subcategories", async () => {
      const mockSubCategories = [
        { subcategoryID: 1, subcategoryName: "SubCategory 1", Category: { categoryName: "Category 1" } },
        { subcategoryID: 2, subcategoryName: "SubCategory 2", Category: { categoryName: "Category 2" } },
      ];
      jest.spyOn(SubCategory, "findAll").mockResolvedValue(mockSubCategories as any);

      const response = await request(app).get("/api/subcategory");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubCategories);
    });

    it("should handle errors when fetching subcategories", async () => {
      jest.spyOn(SubCategory, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/subcategory");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /subcategories/:id", () => {
    it("should return a subcategory by ID", async () => {
      const mockSubCategory = {
        subcategoryID: 1,
        subcategoryName: "SubCategory 1",
        Category: { categoryName: "Category 1" },
      };
      jest.spyOn(SubCategory, "findByPk").mockResolvedValue(mockSubCategory as any);

      const response = await request(app).get("/api/subcategory/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubCategory);
    });

    it("should return 404 if subcategory is not found", async () => {
      jest.spyOn(SubCategory, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/subcategory/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Subcategory not found");
    });

    it("should handle errors when fetching a subcategory by ID", async () => {
      jest.spyOn(SubCategory, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/subcategory/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /subcategories", () => {
    it("should create a new subcategory", async () => {
      const mockSubCategory = { subcategoryID: 1, subcategoryName: "New SubCategory", categoryID: 1 };
      jest.spyOn(SubCategory, "create").mockResolvedValue(mockSubCategory as any);

      const response = await request(app)
        .post("/api/subcategory")
        .send({ subcategoryName: "New SubCategory", categoryID: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockSubCategory);
    });

    it("should handle errors when creating a subcategory", async () => {
      jest.spyOn(SubCategory, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/subcategory")
        .send({ subcategoryName: "New SubCategory", categoryID: 1 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /subcategories/:id", () => {
    it("should update an existing subcategory", async () => {
      const mockSubCategory = { subcategoryID: 1, subcategoryName: "Updated SubCategory", categoryID: 1 };
      jest.spyOn(SubCategory, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockSubCategory),
      } as any);

      const response = await request(app)
        .put("/api/subcategory/1")
        .send({ subcategoryName: "Updated SubCategory", categoryID: 1 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Subcategory updated successfully");
    });

    it("should return 404 if subcategory is not found", async () => {
      jest.spyOn(SubCategory, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/subcategory/999").send({
        subcategoryName: "Updated SubCategory",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Subcategory not found");
    });

    it("should handle errors when updating a subcategory", async () => {
      jest.spyOn(SubCategory, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/subcategory/1").send({
        subcategoryName: "Updated SubCategory",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /subcategories/:id", () => {
    it("should delete a subcategory", async () => {
      jest.spyOn(SubCategory, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/subcategory/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if subcategory is not found", async () => {
      jest.spyOn(SubCategory, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/subcategory/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Subcategory not found");
    });

    it("should handle errors when deleting a subcategory", async () => {
      jest.spyOn(SubCategory, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/subcategory/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});