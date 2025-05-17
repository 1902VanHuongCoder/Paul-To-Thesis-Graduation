import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import Comment from "../models/Comment";

jest.mock("../models");

describe("Comment Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/comment", () => {
    it("should return all comments", async () => {
      const mockComments = [
        {
          commentID: 1,
          userID: 1,
          productID: 1,
          content: "Great product!",
       
          rating: 5,
          status: "active",
        },
        {
          commentID: 2,
          userID: 2,
          productID: 2,
          content: "Not bad.",

          rating: 3,
          status: "inactive",
        },
      ];
      jest.spyOn(Comment, "findAll").mockResolvedValue(mockComments as any);

      const response = await request(app).get("/api/comment");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
    });

    it("should handle errors when fetching comments", async () => {
      jest.spyOn(Comment, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/comment");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/comment/:id", () => {
    it("should return a comment by ID", async () => {
      const mockComment = {
        commentID: 1,
        userID: 1,
        productID: 1,
        content: "Great product!",
 
        rating: 5,
        status: "active",
      };
      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const response = await request(app).get("/api/comment/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComment);
    });

    it("should return 404 if comment is not found", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/comment/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });

    it("should handle errors when fetching a comment by ID", async () => {
      jest.spyOn(Comment, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/comment/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/comment", () => {
    it("should create a new comment", async () => {
      const mockComment = {
        commentID: 1,
        userID: 1,
        productID: 1,
        content: "Great product!",
  
        rating: 5,
        status: "active",
      };
      jest.spyOn(Comment, "create").mockResolvedValue(mockComment as any);

      const response = await request(app)
        .post("/api/comment")
        .send({
          userID: 1,
          productID: 1,
          content: "Great product!",
          rating: 5,
          status: "active",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockComment);
    });

    it("should handle errors when creating a comment", async () => {
      jest.spyOn(Comment, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/comment")
        .send({
          userID: 1,
          productID: 1,
          content: "Great product!",
          rating: 5,
          status: "active",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/comment/:id", () => {
    it("should update an existing comment", async () => {
      const mockComment = {
        commentID: 1,
        userID: 1,
        productID: 1,
        content: "Updated content",
        commentAt: new Date(),
        rating: 4,
        status: "active",
      };
      jest.spyOn(Comment, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockComment),
      } as any);

      const response = await request(app)
        .put("/api/comment/1")
        .send({
          content: "Updated content",
          rating: 4,
          status: "active",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment updated successfully");
    });

    it("should return 404 if comment is not found", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/comment/999").send({
        content: "Updated content",
        rating: 4,
        status: "active",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });

    it("should handle errors when updating a comment", async () => {
      jest.spyOn(Comment, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/comment/1").send({
        content: "Updated content",
        rating: 4,
        status: "active",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/comment/:id", () => {
    it("should delete a comment", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/comment/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if comment is not found", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/comment/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });

    it("should handle errors when deleting a comment", async () => {
      jest.spyOn(Comment, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/comment/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});