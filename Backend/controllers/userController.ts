import { Request, Response } from "express";
import { User } from "../models";
import ShippingAddress from "../models/ShippingAddress";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getAllUsers = async ( 
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// Helper: Generate JWT token
const generateToken = (user: any) => {
  return jwt.sign(
    {
      userID: user.userID,
      email: user.email,
      role: user.role,
      provider: user.provider,
    },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};

// Local Sign Up
export const localSignUp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userID, username, email, password, role, shippingAddress } = req.body;
  console.log(req.body);
  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      let shippingAddressID = null;
      if (shippingAddress && shippingAddress.address && shippingAddress.phone) {
        const newAddress = await ShippingAddress.create({
          userID,
          address: shippingAddress.address,
          phone: shippingAddress.phone,
          isDefault: shippingAddress.isDefault ?? true,
        });
      }
      const user = await User.create({
        userID,
        username,
        email,
        password: hashedPassword,
        role,
        provider: "local",
      
      });

      const token = generateToken(user);
      res.status(201).json({ user, token });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Local Sign In
export const localSignIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, provider: "local" } });
    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken(user);
      res.status(200).json({ user, token });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Google Sign Up / Sign In
export const googleAuth = async (req: Request, res: Response) => {
  const { email, username, avatar, providerID, userID } = req.body;
  console.log(req.body);
  try {
    let user = await User.findOne({ where: { email, provider: "google" } });
    if (!user) {
      user = await User.create({
        userID,
        username,
        email,
        avatar,
        provider: "google",
        providerID,
        role: "customer", // or assign based on your logic
      });
    }
    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get current user info (protected route)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  // req.user should be set by auth middleware after verifying JWT
  const userID = (req as any).user?.userID;
  try {
    const user = await User.findByPk(userID, { include: [ShippingAddress] });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Example: Middleware to protect routes (add to your middleware folder)
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: Function
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
  } else {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  }
};
