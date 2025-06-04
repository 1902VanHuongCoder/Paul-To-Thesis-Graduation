import { Request, Response } from "express";
import { User } from "../models";
import ShippingAddress from "../models/ShippingAddress";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

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
};

export const getUserByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userID = req.params.userID;
  try {
    const user = await User.findByPk(userID);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

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
        role: "cus", // or assign based on your logic
      });
    }
    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userID = req.params.userID;
  const { username, email, avatar, password } = req.body;
  try {
    const user = await User.findByPk(userID);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    // Handle password update
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const confirmPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userID, password } = req.body;
  try {
    const user = await User.findByPk(userID);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.providerID) {
      res.status(200).json({
        message:
          "User is authenticated via Google, no password confirmation needed",
      });
      return;
    }
    const isMatch = await bcrypt.compare(password, user?.password || "");
    if (isMatch) {
      res.status(200).json({ message: "Password confirmed" });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Helper to send email (configure with your SMTP)
const transporter = nodemailer.createTransport({
  service: "Gmail", // or your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateSecure6DigitCode() {
  // Generates a random integer between 0 and 999999, then pads with zeros
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  return code;
}

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404).json({ error: "Email không tồn tại" });
    return;
  }

  // Generate code and expiry (e.g. 6 digits, 10 min)
  const code = generateSecure6DigitCode();
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Save code and expiry to user (or a separate table)
  try {
    user.resetPasswordCode = code;
    user.resetPasswordCodeExpiry = codeExpiry;
    await user.save();
  } catch (error) {
    console.error("Error saving reset code:", error);
    res.status(500).json({ error: (error as Error).message });
    return;
  }

  // Send email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác nhận đặt lại mật khẩu",
      text: `Mã xác nhận của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
    });
    res.json({ message: "Đã gửi mã xác nhận tới email của bạn." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Không thể gửi email xác nhận" });
    return;
  }
};
