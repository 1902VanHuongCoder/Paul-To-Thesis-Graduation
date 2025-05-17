import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { News, TagOfNews, NewsTagOfNews } from "../models";

jest.mock("../models");

describe("News Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/news", () => {
    it("should return all news articles", async () => {
      const mockNews = [
        {
          newsID: 1,
          userID: 1,
          title: "News Title 1",
          subtitle: "Subtitle 1",
          images: "image1.jpg",
          views: 100,
          tags: [{ newsTagID: 1, tagName: "Tag 1" }],
        },
        {
          newsID: 2,
          userID: 2,
          title: "News Title 2",
          subtitle: "Subtitle 2",
          images: "image2.jpg",
          views: 200,
          tags: [{ newsTagID: 2, tagName: "Tag 2" }],
        },
      ];
      jest.spyOn(News, "findAll").mockResolvedValue(mockNews as any);

      const response = await request(app).get("/api/news");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNews);
    });

    it("should handle errors when fetching news articles", async () => {
      jest.spyOn(News, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/news");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/news/:id", () => {
    it("should return a news article by ID", async () => {
      const mockNews = {
        newsID: 1,
        userID: 1,
        title: "News Title 1",
        subtitle: "Subtitle 1",
        images: "image1.jpg",
        views: 100,
        tags: [{ newsTagID: 1, tagName: "Tag 1" }],
      };
      jest.spyOn(News, "findByPk").mockResolvedValue(mockNews as any);

      const response = await request(app).get("/api/news/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNews);
    });

    it("should return 404 if news article is not found", async () => {
      jest.spyOn(News, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/news/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("News article not found");
    });

    it("should handle errors when fetching a news article by ID", async () => {
      jest.spyOn(News, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/news/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/news", () => {
    it("should create a new news article", async () => {
      const mockNews = {
        newsID: 1,
        userID: 1,
        title: "News Title 1",
        subtitle: "Subtitle 1",
        images: "image1.jpg",
        views: 0,
      };
      jest.spyOn(News, "create").mockResolvedValue(mockNews as any);
      jest.spyOn(TagOfNews, "findAll").mockResolvedValue([{ newsTagID: 1 }] as any);
      jest.spyOn(NewsTagOfNews, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .post("/api/news")
        .send({
          userID: 1,
          title: "News Title 1",
          subtitle: "Subtitle 1",
          images: "image1.jpg",
          tags: [1],
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockNews);
    });

    it("should handle errors when creating a news article", async () => {
      jest.spyOn(News, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/news")
        .send({
          userID: 1,
          title: "News Title 1",
          subtitle: "Subtitle 1",
          images: "image1.jpg",
          tags: [1],
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/news/:id", () => {
    it("should update an existing news article", async () => {
      const mockNews = {
        newsID: 1,
        userID: 1,
        title: "Updated Title",
        subtitle: "Updated Subtitle",
        images: "updated_image.jpg",
      };
      jest.spyOn(News, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockNews),
      } as any);
      jest.spyOn(TagOfNews, "findAll").mockResolvedValue([{ newsTagID: 1 }] as any);
      jest.spyOn(NewsTagOfNews, "destroy").mockResolvedValue(1);
      jest.spyOn(NewsTagOfNews, "bulkCreate").mockResolvedValue([]);

      const response = await request(app)
        .put("/api/news/1")
        .send({
          title: "Updated Title",
          subtitle: "Updated Subtitle",
          images: "updated_image.jpg",
          tags: [1],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("News article updated successfully");
    });

    it("should return 404 if news article is not found", async () => {
      jest.spyOn(News, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/news/999").send({
        title: "Updated Title",
        subtitle: "Updated Subtitle",
        images: "updated_image.jpg",
        tags: [1],
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("News article not found");
    });

    it("should handle errors when updating a news article", async () => {
      jest.spyOn(News, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/news/1").send({
        title: "Updated Title",
        subtitle: "Updated Subtitle",
        images: "updated_image.jpg",
        tags: [1],
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/news/:id", () => {
    it("should delete a news article", async () => {
      jest.spyOn(News, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);
      jest.spyOn(NewsTagOfNews, "destroy").mockResolvedValue(1);

      const response = await request(app).delete("/api/news/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if news article is not found", async () => {
      jest.spyOn(News, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/news/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("News article not found");
    });

    it("should handle errors when deleting a news article", async () => {
      jest.spyOn(News, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/news/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});