import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from app.ts
import { User } from "../models";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));
import { generateToken } from "../utils/generateToken";

jest.mock("../utils/generateToken");  

jest.mock("../models", () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Tag: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  ProductTag: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  User: {
    findAll: jest.fn(), 
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn()
}
}));

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/api/auth/login").send({ email: "" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Email and password are required");
    });

    it("should return 401 if the user is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should return 401 if the password is incorrect", async () => {
      const mockUser = { getDataValue: jest.fn().mockReturnValue("hashedpassword") };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid email or password");
    });

    it("should return 200 and a token if the login is successful", async () => {
      const mockUser = {
        getDataValue: jest.fn()
          .mockImplementation((key: "id" | "email" | "role" | "password") => {
            const data = { id: 1, email: "user@example.com", role: "user", password: "hashedpassword" };
            return data[key];
          }),
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("mocked-token");

      const response = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "user@example.com",
        role: "user",
        token: "mocked-token",
      });
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedpassword");
      expect(generateToken).toHaveBeenCalledWith(1);
    });

    it("should return 500 if an error occurs", async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Database error");
    });
  });
});