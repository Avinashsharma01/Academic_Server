import express from "express";
import { registerUser, loginUser, verifyUserEmail, authUser, updateUserProfile, logoutUser, getAllUsers } from "../Controllers/authController.js";
import { registerAdmin, loginAdmin, verifyAdminEmail, authAdmin } from "../Controllers/AdminController.js";
import { socialLogin } from "../Controllers/socialAuthController.js";
import { authenticateUser, authorizeAdmin } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/multerMiddlewareForProFilePic.js";
import { loginRateLimiter } from "../Middleware/RateLimitter.js";
const router = express.Router();

// User Signup
router.post("/signup", registerUser);

// User Login
router.post("/login", loginRateLimiter, loginUser);

// User Logout
router.post("/logout", logoutUser);

// Google / Social Login
router.post("/google", socialLogin);

// Fetch all users
router.get("/users", authenticateUser, authorizeAdmin, getAllUsers)

// Auth User
router.get("/me", authenticateUser, authUser);

// Auth Admin
router.get("/admin/me", authenticateUser, authAdmin);

// Update User Profile
router.put("/update-profile", authenticateUser, upload.single("profilePic"), updateUserProfile)

// verify user email
router.get("/verify/user/:token", verifyUserEmail);

// User Signup
router.post("/signupAdmin", registerAdmin);

// User Login
router.post("/loginAdmin", loginRateLimiter, loginAdmin);

//verify admin email
router.get("/verify/admin/:token", verifyAdminEmail);

export default router;

