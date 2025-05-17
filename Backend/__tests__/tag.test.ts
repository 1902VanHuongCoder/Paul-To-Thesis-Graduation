import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Tag, Product } from "../models";

jest.mock("../models");

describe("Tag Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /tags", () => {
    it("should return all tags", async () => {
      const mockTags = [
        { tagID: 1, tagName: "Tag 1", Products: [] },
        { tagID: 2, tagName: "Tag 2", Products: [] },
      ];
      jest.spyOn(Tag, "findAll").mockResolvedValue(mockTags as any);

      const response = await request(app).get("/api/tag");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTags);
    });

    it("should handle errors when fetching tags", async () => {
      jest.spyOn(Tag, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/tag");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /tags/:id", () => {
    it("should return a tag by ID", async () => {
      const mockTag = { tagID: 1, tagName: "Tag 1", Products: [] };
      jest.spyOn(Tag, "findByPk").mockResolvedValue(mockTag as any);

      const response = await request(app).get("/api/tag/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTag);
    });

    it("should return 404 if tag is not found", async () => {
      jest.spyOn(Tag, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/tag/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should handle errors when fetching a tag by ID", async () => {
      jest.spyOn(Tag, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/tag/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /tags", () => {
    it("should create a new tag", async () => {
      const mockTag = { tagID: 1, tagName: "New Tag" };
      jest.spyOn(Tag, "create").mockResolvedValue(mockTag as any);

      const response = await request(app)
        .post("/api/tag")
        .send({ tagName: "New Tag" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTag);
    });

    it("should handle errors when creating a tag", async () => {
      jest.spyOn(Tag, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/tag")
        .send({ tagName: "New Tag" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /tags/:id", () => {
    it("should update an existing tag", async () => {
      const mockTag = { tagID: 1, tagName: "Updated Tag" };
      jest.spyOn(Tag, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockTag),
      } as any);

      const response = await request(app)
        .put("/api/tag/1")
        .send({ tagName: "Updated Tag" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Tag updated successfully");
    });

    it("should return 404 if tag is not found", async () => {
      jest.spyOn(Tag, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/tag/999").send({
        tagName: "Updated Tag",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should handle errors when updating a tag", async () => {
      jest.spyOn(Tag, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/tag/1").send({
        tagName: "Updated Tag",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /tags/:id", () => {
    it("should delete a tag", async () => {
      jest.spyOn(Tag, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/tag/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if tag is not found", async () => {
      jest.spyOn(Tag, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/tag/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should handle errors when deleting a tag", async () => {
      jest.spyOn(Tag, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/tag/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});