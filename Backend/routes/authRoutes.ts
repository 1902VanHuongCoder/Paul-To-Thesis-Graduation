import express from "express";
import { loginUser } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", loginUser);

export default router; 