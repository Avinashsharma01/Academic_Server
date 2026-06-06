import SuperAdmin from "../Models/SuperAdminModel.js";
import User from "../Models/UserModel.js";
import Admin from "../Models/AdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/SuperAdminEmailVerification.js";


// SuperAdmin Signup
export const registerSuperAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingSuperAdmin = await SuperAdmin.findOne({ email });
        if (existingSuperAdmin) return res.status(400).json({ message: "SuperAdmin already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newSuperAdmin = new SuperAdmin({ name, email, password: hashedPassword });
        await newSuperAdmin.save();

        await sendVerificationEmail(email, newSuperAdmin._id);

        res.status(201).json({
            message: "Registration successful! Please check your email for verification.",
        });
    } catch (error) {
        console.error("SuperAdmin register error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// SuperAdmin Login
export const loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin) return res.status(400).json({ message: "Invalid email or password" });

        if (!superAdmin.isVerified) {
            return res.status(403).json({ message: "Email not verified. Please verify your email first." });
        }

        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: superAdmin._id, role: superAdmin.role }, process.env.JWT_SECRET, {
            // expiresIn: "1m", // Test expiry: 1 minute
            expiresIn: "1d", // Production expiry: 1 day
        });

        res.cookie("SuperauthToken", token, {
            httpOnly: true,
            secure: true, // Must be true for cross-site cookies
            sameSite: "none", // Must be "none" for cross-site requests
            path: "/",
            // maxAge: 60 * 1000, // Match 1 minute token expiry
            maxAge: 24 * 60 * 60 * 1000, // Match 1 day token expiry
        }).status(200).json({
            message: "Login successful",
            superAdmin: {
                id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                role: superAdmin.role,
            },
        });
    } catch (error) {
        console.error("SuperAdmin login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// SuperAdmin Logout
export const logoutSuperAdmin = async (req, res) => {
    try {
        res.clearCookie("SuperauthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        }).clearCookie("SuperauthToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/superadmin",
        }).status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Verify SuperAdmin Email
export const verifySuperAdminEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(400).json({ message: "Invalid or expired token" });

        await SuperAdmin.findByIdAndUpdate(decoded.id, { isVerified: true });
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Resend Verification Email
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin) return res.status(400).json({ message: "SuperAdmin not found" });

        await sendVerificationEmail(email, superAdmin._id);
        res.status(200).json({ message: "Verification email resent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get SuperAdmin Profile (auth check)
export const getSuperAdminProfile = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.findById(req.superAdmin.id).select("-password -__v");
        if (!superAdmin) return res.status(404).json({ message: "SuperAdmin not found" });

        res.status(200).json({ superAdmin });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update SuperAdmin Profile
export const updateSuperAdminProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const superAdmin = await SuperAdmin.findById(req.superAdmin.id);
        if (!superAdmin) return res.status(404).json({ message: "SuperAdmin not found" });

        superAdmin.name = name || superAdmin.name;
        superAdmin.email = email || superAdmin.email;
        await superAdmin.save();

        res.status(200).json({ message: "Profile updated successfully", superAdmin });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// MANAGEMENT ENDPOINTS — Control Students & Admins
// =====================================================

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const totalAdmins = await Admin.countDocuments();
        const verifiedAdmins = await Admin.countDocuments({ isVerified: true });

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const recentUsers = await User.countDocuments({ createdAt: { $gte: lastMonth } });
        const recentAdmins = await Admin.countDocuments({ createdAt: { $gte: lastMonth } });

        res.status(200).json({
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                unverified: totalUsers - verifiedUsers,
                recentlyJoined: recentUsers,
            },
            admins: {
                total: totalAdmins,
                verified: verifiedAdmins,
                unverified: totalAdmins - verifiedAdmins,
                recentlyJoined: recentAdmins,
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -__v").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Toggle User Verification
export const toggleUserVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified = !user.isVerified;
        await user.save();

        res.status(200).json({
            message: `User ${user.isVerified ? "verified" : "unverified"} successfully`,
            user,
        });
    } catch (error) {
        console.error("Toggle user verification error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get All Admins
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password -__v").sort({ createdAt: -1 });
        res.status(200).json(admins);
    } catch (error) {
        console.error("Fetch admins error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete an Admin
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        await Admin.findByIdAndDelete(id);
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Delete admin error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Toggle Admin Verification
export const toggleAdminVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        admin.isVerified = !admin.isVerified;
        await admin.save();

        res.status(200).json({
            message: `Admin ${admin.isVerified ? "verified" : "unverified"} successfully`,
            admin,
        });
    } catch (error) {
        console.error("Toggle admin verification error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
