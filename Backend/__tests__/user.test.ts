import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from app.ts
import User from "../models/User";
import bcrypt from "bcryptjs";

jest.mock("../models/User");
jest.mock("bcryptjs");

describe("User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /users", () => {
    it("should return 400 if role is not provided", async () => {
      const response = await request(app).get("/api/users").send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Role is required");
    });

    it("should return 400 if role is invalid", async () => {
      const response = await request(app)
        .get("/api/users")
        .send({ role: "invalidRole" });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid role");
    });

    it("should return 200 and users if role is valid", async () => {
      const mockUsers = [{ id: 1, username: "John", role: "staff" }];
      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app)
        .get("/api/users")
        .send({ role: "staff" });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });
  });

  describe("POST /users", () => {
    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/api/users").send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Username, email, role, and password are required"
      );
    });

    it("should return 400 if role is invalid", async () => {
      const response = await request(app).post("/api/users").send({
        username: "John",
        email: "john@example.com",
        role: "invalidRole",
        password: "password123",
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid role");
    });

    it("should create a new user and return 201", async () => {
      const mockUser = {
        id: 1,
        username: "John",
        email: "john@example.com",
        role: "staff",
      };
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      const response = await request(app).post("/api/users").send({
        username: "John",
        email: "john@example.com",
        role: "staff",
        password: "password123",
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUser);
    });
  });

  describe("GET /users/:id", () => {
    it("should return 404 if user is not found", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/api/users/1");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 200 and the user if found", async () => {
      const mockUser = { id: 1, username: "John", role: "staff" };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get("/api/users/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });
  });

  describe("PUT /users/:id", () => {
    it("should return 404 if user is not found", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put("/api/users/1")
        .send({ username: "Updated" });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should update the user and return 200", async () => {
      const mockUser = { id: 1, username: "John", update: jest.fn() };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      const response = await request(app)
        .put("/api/users/1")
        .send({ username: "Updated", password: "newPassword" });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User updated successfully");
      expect(mockUser.update).toHaveBeenCalledWith({
        username: "Updated",
        password: "hashedPassword",
      });
    });
  });

  describe("DELETE /users/:id", () => {
    it("should return 404 if user is not found", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete("/api/users/1");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should delete the user and return 204", async () => {
      const mockUser = { id: 1, destroy: jest.fn() };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).delete("/api/users/1");
      expect(response.status).toBe(204);
      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });
});