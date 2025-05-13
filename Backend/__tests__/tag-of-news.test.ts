import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { TagOfNews } from "../models";

jest.mock("../models");

describe("TagOfNews Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tag-of-news", () => {
    it("should return all tags", async () => {
      const mockTags = [
        { newsTagID: 1, tagName: "Technology" },
        { newsTagID: 2, tagName: "Health" },
      ];
      jest.spyOn(TagOfNews, "findAll").mockResolvedValue(mockTags as any);

      const response = await request(app).get("/api/tag-of-news");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTags);
    });

    it("should handle errors when fetching tags", async () => {
      jest
        .spyOn(TagOfNews, "findAll")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/tag-of-news");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/tag-of-news/:id", () => {
    it("should return a tag by ID", async () => {
      const mockTag = { newsTagID: 1, tagName: "Technology" };
      jest.spyOn(TagOfNews, "findByPk").mockResolvedValue(mockTag as any);

      const response = await request(app).get("/api/tag-of-news/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTag);
    });

    it("should return 404 if tag is not found", async () => {
      jest.spyOn(TagOfNews, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/tag-of-news/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should handle errors when fetching a tag by ID", async () => {
      jest
        .spyOn(TagOfNews, "findByPk")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/tag-of-news/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/tag-of-news", () => {
    it("should create a new tag", async () => {
      const mockTag = { newsTagID: 1, tagName: "Technology" };
      jest.spyOn(TagOfNews, "create").mockResolvedValue(mockTag as any);

      const response = await request(app)
        .post("/api/tag-of-news")
        .send({ tagName: "Technology" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTag);
    });

    it("should handle errors when creating a tag", async () => {
      jest
        .spyOn(TagOfNews, "create")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/tag-of-news")
        .send({ tagName: "Technology" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/tag-of-news/:id", () => {
    it("should update an existing tag", async () => {
      const mockTag = { newsTagID: 1, tagName: "Updated Technology" };
      jest.spyOn(TagOfNews, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockTag),
      } as any);

      const response = await request(app)
        .put("/api/tag-of-news/1")
        .send({ tagName: "Updated Technology" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Tag updated successfully");
    });

    it("should return 404 if tag is not found", async () => {
      jest.spyOn(TagOfNews, "findByPk").mockResolvedValue(null);

      const response = await request(app)
        .put("/api/tag-of-news/999")
        .send({ tagName: "Updated Technology" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should handle errors when updating a tag", async () => {
      jest
        .spyOn(TagOfNews, "findByPk")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/tag-of-news/1")
        .send({ tagName: "Updated Technology" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/tag-of-news/:id", () => {
    it("should delete a tag", async () => {
      jest.spyOn(TagOfNews, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/tag-of-news/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if tag is not found", async () => {
      jest.spyOn(TagOfNews, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/tag-of-news/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should handle errors when deleting a tag", async () => {
      jest
        .spyOn(TagOfNews, "findByPk")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/tag-of-news/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});
