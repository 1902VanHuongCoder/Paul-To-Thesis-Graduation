import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import { Location } from "../models";

jest.mock("../models");

describe("Location Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/location", () => {
    it("should return all locations", async () => {
      const mockLocations = [
        { id: 1, locationName: "Location 1", address: "Address 1", hotline: "123456789" },
        { id: 2, locationName: "Location 2", address: "Address 2", hotline: "987654321" },
      ];
      jest.spyOn(Location, "findAll").mockResolvedValue(mockLocations as any);

      const response = await request(app).get("/api/location");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLocations);
    });

    it("should handle errors when fetching locations", async () => {
      jest.spyOn(Location, "findAll").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/location");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/location/:id", () => {
    it("should return a location by ID", async () => {
      const mockLocation = {
        id: 1,
        locationName: "Location 1",
        address: "Address 1",
        hotline: "123456789",
      };
      jest.spyOn(Location, "findByPk").mockResolvedValue(mockLocation as any);

      const response = await request(app).get("/api/location/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLocation);
    });

    it("should return 404 if location is not found", async () => {
      jest.spyOn(Location, "findByPk").mockResolvedValue(null);

      const response = await request(app).get("/api/location/999");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Location not found");
    });

    it("should handle errors when fetching a location by ID", async () => {
      jest.spyOn(Location, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/location/1");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("POST /api/location", () => {
    it("should create a new location", async () => {
      const mockLocation = {
        id: 1,
        locationName: "New Location",
        address: "New Address",
        hotline: "123456789",
      };
      jest.spyOn(Location, "create").mockResolvedValue(mockLocation as any);

      const response = await request(app)
        .post("/api/location")
        .send({ locationName: "New Location", address: "New Address", hotline: "123456789" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockLocation);
    });

    it("should handle errors when creating a location", async () => {
      jest.spyOn(Location, "create").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/location")
        .send({ locationName: "New Location", address: "New Address", hotline: "123456789" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/location/:id", () => {
    it("should update an existing location", async () => {
      const mockLocation = {
        id: 1,
        locationName: "Updated Location",
        address: "Updated Address",
        hotline: "987654321",
      };
      jest.spyOn(Location, "findByPk").mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockLocation),
      } as any);

      const response = await request(app)
        .put("/api/location/1")
        .send({ locationName: "Updated Location", address: "Updated Address", hotline: "987654321" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Location updated successfully");
    });

    it("should return 404 if location is not found", async () => {
      jest.spyOn(Location, "findByPk").mockResolvedValue(null);

      const response = await request(app).put("/api/location/999").send({
        locationName: "Updated Location",
        address: "Updated Address",
        hotline: "987654321",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Location not found");
    });

    it("should handle errors when updating a location", async () => {
      jest.spyOn(Location, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/location/1").send({
        locationName: "Updated Location",
        address: "Updated Address",
        hotline: "987654321",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("DELETE /api/location/:id", () => {
    it("should delete a location", async () => {
      jest.spyOn(Location, "findByPk").mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app).delete("/api/location/1");

      expect(response.status).toBe(204);
    });

    it("should return 404 if location is not found", async () => {
      jest.spyOn(Location, "findByPk").mockResolvedValue(null);

      const response = await request(app).delete("/api/location/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Location not found");
    });

    it("should handle errors when deleting a location", async () => {
      jest.spyOn(Location, "findByPk").mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/location/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});