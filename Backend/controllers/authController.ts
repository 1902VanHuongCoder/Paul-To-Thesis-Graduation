import { Request, Response } from "express";
import  { User }  from "../models";
import { generateToken } from "../utils/generateToken";
import bcrypt from "bcryptjs";

export const loginUser = async (req: Request, res: Response): Promise<void> => {

  console.log("Request body",req.body); // Log the request body for debugging


  const { email, password } = req.body; // Extract email and password from the request body

  try {
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Compare the provided password with the hashed password in the database
    if (user && (await bcrypt.compare(password, user.getDataValue("password")))) {
      res.status(200).json({
        id: user.getDataValue("id"),
        email: user.getDataValue("email"),
        role: user.getDataValue("role"),
        token: generateToken(user.getDataValue("id")),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};