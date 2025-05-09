import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface AuthRequest extends Request {
  user?: any; // Add a `user` property to the request object
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // Check if the token is provided in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      // Attach the user information to the request object
      req.user = decoded;

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};