import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Origin, Product } from "../models";

jest.mock("../models");

describe("Origin Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/origin", () => {
    it("should return all origins", async () => {
      const mockOrigins = [
        { originID: 1, originName: "Origin 1", Products: [] },
        { originID: 2, originName: "Origin 2", Products: [] },
      ];
      jest.spyOn(Origin, "findAll").mockResolvedValue(mockOrigins as any);

      const response = await request(app).get("/api/origin");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrigins);
    });

    it("should handle errors when fetching origins", async () => {
      jest.spyOn(Origin, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/origin");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/origin/:id", () => {
    it("should return an origin by ID", async () => {
      const mockOrigin = { originID: 1, originName: "Origin 1", Products: [] };
      jest.spyOn(Origin, "findByPk").mockResolvedValue(mockOrigin as any);

      const response = await request(app).get("/api/origin/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrigin);
    });

    it("should return 404 if origin is not found", async () => {
      jest.spyOn(Origin, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/origin/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Origin not found");
    });

    it("should handle errors when fetching an origin by ID", async () => {
      jest.spyOn(Origin, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/origin/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/origin", () => {
    it("should create a new origin", async () => {
      const mockOrigin = { originID: 1, originName: "New Origin" };
      jest.spyOn(Origin, "create").mockResolvedValue(mockOrigin as any);

      const response = await request(app)
        .post("/api/origin")
        .send({ originName: "New Origin" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockOrigin);
    });

    it("should handle errors when creating an origin", async () => {
      jest.spyOn(Origin, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/origin")
        .send({ originName: "New Origin" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/origin/:id", () => {
    it("should update an existing origin", async () => {
      const mockOrigin = { originID: 1, originName: "Updated Origin" };
      jest.spyOn(Origin, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockOrigin),
      } as any);

      const response = await request(app)
        .put("/api/origin/1")
        .send({ originName: "Updated Origin" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Origin updated successfully");
    });

    it("should return 404 if origin is not found", async () => {
      jest.spyOn(Origin, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/origin/999").send({
        originName: "Updated Origin",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Origin not found");
    });

    it("should handle errors when updating an origin", async () => {
      jest.spyOn(Origin, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/origin/1").send({
        originName: "Updated Origin",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/origin/:id", () => {
    it("should delete an origin", async () => {
      jest.spyOn(Origin, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/origin/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if origin is not found", async () => {
      jest.spyOn(Origin, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/origin/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Origin not found");
    });

    it("should handle errors when deleting an origin", async () => {
      jest.spyOn(Origin, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/origin/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});