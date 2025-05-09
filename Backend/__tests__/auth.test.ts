import request from "supertest";
import app from "../server"; // Assuming your Express app is exported from server.ts
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";

jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("../utils/generateToken");

describe("Auth Controller - loginUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /login", () => {
    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/api/auth/login").send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email and password are required");
    });

    it("should return 401 if user is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 401 if password is incorrect", async () => {
      const mockUser = { getDataValue: jest.fn().mockImplementation((key) => key === "password" ? "hashedPassword" : null) };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongPassword" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return 200 and a token if login is successful", async () => {
      const mockUser = {
        getDataValue: jest.fn().mockImplementation((key: "id" | "email" | "role" | "password") => {
          const data = {
            id: 1,
            email: "test@example.com",
            role: "staff",
            password: "hashedPassword",
          };
          return data[key];
        }),
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("mockToken");

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "test@example.com",
        role: "staff",
        token: "mockToken",
      });
    });

    it("should return 500 if an error occurs", async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});