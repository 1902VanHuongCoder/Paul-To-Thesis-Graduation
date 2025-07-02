import express from "express";
import {
  localSignUp,
  localSignIn,
  googleAuth,
  getAllUsers,
  updateUser,
  getUserByID,
  confirmPassword,
  forgotPassword,
  checkRecoveryCode,
  getUsersBasedOnRole,
} from "../controllers/userController";

const router = express.Router();

// General routes 
// Local sign up
router.post("/signup", localSignUp);

// Local sign in
router.post("/signin", localSignIn);

// Google sign up/sign in
router.post("/google", googleAuth);

// Get all users
router.get("/", getAllUsers);

// Get all users based on their role
router.get("/role/:role", getUsersBasedOnRole);

// Get user info based on userID
router.get("/:userID",getUserByID); 

// Update user information
router.put("/:userID", updateUser); 

// Confirm user password 
router.post("/confirm-password",confirmPassword); 

// Handle forgot password
router.post("/forgot-password", forgotPassword);

// Handle checking password recovery code 
router.post("/check-recovery-code", checkRecoveryCode);

export default router;