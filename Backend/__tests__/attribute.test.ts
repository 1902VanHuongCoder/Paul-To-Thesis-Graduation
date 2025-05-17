import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Attribute, Category } from "../models";

jest.mock("../models");

describe("Attribute Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/attribute", () => {
    it("should return all attributes", async () => {
      const mockAttributes = [
        {
          id: 1,
          name: "Attribute 1",
          label: "Label 1",
          data_type: "string",
          required: true,
          Category: { categoryName: "Category 1" },
        },
        {
          id: 2,
          name: "Attribute 2",
          label: "Label 2",
          data_type: "number",
          required: false,
          Category: { categoryName: "Category 2" },
        },
      ];
      jest.spyOn(Attribute, "findAll").mockResolvedValue(mockAttributes as any);

      const response = await request(app).get("/api/attribute");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAttributes);
    });

    it("should handle errors when fetching attributes", async () => {
      jest.spyOn(Attribute, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/attribute");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/attribute/:id", () => {
    it("should return an attribute by ID", async () => {
      const mockAttribute = {
        id: 1,
        name: "Attribute 1",
        label: "Label 1",
        data_type: "string",
        required: true,
        Category: { categoryName: "Category 1" },
      };
      jest.spyOn(Attribute, "findByPk").mockResolvedValue(mockAttribute as any);

      const response = await request(app).get("/api/attribute/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAttribute);
    });

    it("should return 404 if attribute is not found", async () => {
      jest.spyOn(Attribute, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/attribute/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Attribute not found");
    });

    it("should handle errors when fetching an attribute by ID", async () => {
      jest.spyOn(Attribute, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/attribute/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/attribute", () => {
    it("should create a new attribute", async () => {
      const mockAttribute = {
        id: 1,
        name: "New Attribute",
        label: "New Label",
        data_type: "string",
        required: true,
      };
      jest.spyOn(Attribute, "create").mockResolvedValue(mockAttribute as any);

      const response = await request(app)
        .post("/api/attribute")
        .send({
          categoryID: 1,
          name: "New Attribute",
          label: "New Label",
          data_type: "string",
          required: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockAttribute);
    });

    it("should handle errors when creating an attribute", async () => {
      jest.spyOn(Attribute, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/attribute")
        .send({
          categoryID: 1,
          name: "New Attribute",
          label: "New Label",
          data_type: "string",
          required: true,
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/attribute/:id", () => {
    it("should update an existing attribute", async () => {
      const mockAttribute = {
        id: 1,
        name: "Updated Attribute",
        label: "Updated Label",
        data_type: "string",
        required: true,
      };
      jest.spyOn(Attribute, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockAttribute),
      } as any);

      const response = await request(app)
        .put("/api/attribute/1")
        .send({
          categoryID: 1,
          name: "Updated Attribute",
          label: "Updated Label",
          data_type: "string",
          required: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Attribute updated successfully");
    });

    it("should return 404 if attribute is not found", async () => {
      jest.spyOn(Attribute, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/attribute/999").send({
        categoryID: 1,
        name: "Updated Attribute",
        label: "Updated Label",
        data_type: "string",
        required: true,
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Attribute not found");
    });

    it("should handle errors when updating an attribute", async () => {
      jest.spyOn(Attribute, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/attribute/1").send({
        categoryID: 1,
        name: "Updated Attribute",
        label: "Updated Label",
        data_type: "string",
        required: true,
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/attribute/:id", () => {
    it("should delete an attribute", async () => {
      jest.spyOn(Attribute, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/attribute/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if attribute is not found", async () => {
      jest.spyOn(Attribute, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/attribute/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Attribute not found");
    });

    it("should handle errors when deleting an attribute", async () => {
      jest.spyOn(Attribute, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/attribute/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});