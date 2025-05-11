import { Request, Response } from "express";
import { User } from "../models";
import bcrypt from "bcryptjs";

// Fetch all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body;

  try {
    if (!role) {
      res.status(400).json({ message: "Role is required" });
      return;
    }

    if (!["staff", "administrator", "customer"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const users = await User.findAll({ where: { role } });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, role, password, address, phone, avatar, position, department, loyaltyPoints } = req.body;

  try {
    if (!username || !email || !role || !password) {
      res.status(400).json({ message: "Username, email, role, and password are required" });
      return;
    }

    if (!["staff", "administrator", "customer"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      role,
      password: hashedPassword,
      address,
      phone,
      avatar,
      position,
      department,
      loyaltyPoints,
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Fetch a user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { password, ...updatedData } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash the password if it is being updated
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updatedData);
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete a user by ID
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};