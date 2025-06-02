import express from "express";
import {
  localSignUp,
  localSignIn,
  googleAuth,
  getMe,
  authenticateJWT,
} from "../controllers/userController";

const router = express.Router();

// Local sign up
router.post("/signup", localSignUp);

// Local sign in
router.post("/signin", localSignIn);

// Google sign up/sign in
router.post("/google", googleAuth);

// Get current user info (protected)
router.get("/me", authenticateJWT, getMe);

export default router;