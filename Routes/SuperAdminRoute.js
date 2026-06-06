import express from "express";
import {
    registerSuperAdmin,
    loginSuperAdmin,
    logoutSuperAdmin,
    verifySuperAdminEmail,
    resendVerificationEmail,
    getSuperAdminProfile,
    updateSuperAdminProfile,
    getDashboardStats,
    getAllUsers,
    deleteUser,
    toggleUserVerification,
    getAllAdmins,
    deleteAdmin,
    toggleAdminVerification,
} from "../Controllers/SuperAdminController.js";
import { getAllFeedbacks, deleteFeedback } from "../Controllers/feedbackController.js";
import { authenticateSuperAdmin } from "../Middleware/SuperAdminMiddleware.js";
import { loginRateLimiter } from "../Middleware/RateLimitter.js";

const router = express.Router();

// Public routes
router.post("/register", registerSuperAdmin);
router.post("/login", loginRateLimiter, loginSuperAdmin);
router.get("/logout", logoutSuperAdmin);
router.get("/verify/:token", verifySuperAdminEmail);
router.post("/resend-verification", resendVerificationEmail);

// Protected routes — SuperAdmin profile
router.get("/profile", authenticateSuperAdmin, getSuperAdminProfile);
router.put("/profile", authenticateSuperAdmin, updateSuperAdminProfile);

// Protected routes — Management (Students & Admins)
router.get("/stats", authenticateSuperAdmin, getDashboardStats);

// User management
router.get("/users", authenticateSuperAdmin, getAllUsers);
router.delete("/users/:id", authenticateSuperAdmin, deleteUser);
router.put("/users/:id/verify", authenticateSuperAdmin, toggleUserVerification);

// Admin management
router.get("/admins", authenticateSuperAdmin, getAllAdmins);
router.delete("/admins/:id", authenticateSuperAdmin, deleteAdmin);
router.put("/admins/:id/verify", authenticateSuperAdmin, toggleAdminVerification);

// Feedback management
router.get("/feedback", authenticateSuperAdmin, getAllFeedbacks);
router.delete("/feedback/:id", authenticateSuperAdmin, deleteFeedback);

export default router;
