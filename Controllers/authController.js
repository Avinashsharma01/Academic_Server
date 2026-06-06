import User from "../Models/UserModel.js";
import Admin from "../Models/AdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/UserEmailVerification.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// User Signup
export const registerUser = catchAsync(async (req, res) => {
    const { name, course, branch, enrollment, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        course,
        branch,
        enrollment,
        email,
        password: hashedPassword,
        role,
    });

    await newUser.save();
    await sendVerificationEmail(email, newUser._id);

    res.status(201).json({
        message: "Registration successful! Please check your email for verification.",
    });
});

// User Login
export const loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid email or password", 400);
    }

    if (!user.isVerified) {
        throw new AppError("User not verified", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid email or password", 400);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1d",

        // expiresIn: "1m", // Token expires in 1 minute for testing purposes  
    });

    res.cookie("authToken", token, {
        httpOnly: true,
        secure: true, // Must be true for cross-site cookies
        sameSite: "none", // Must be "none" for cross-site requests
        path: "/",
        // maxAge: 60 * 1000, // Match the 1 minute token expiry used above

        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
        user: {
            id: user._id,
            name: user.name,
            course: user.course,
            branch: user.branch,
            enrollment: user.enrollment,
            email: user.email,
            role: user.role,
        },
    });
});

// fetch the logged user
export const authUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({ user });
});



// ✅ Update User Profile (Name & Profile Picture)
export const updateUserProfile = catchAsync(async (req, res) => {
    const { name } = req.body;
    let profilePic = req.user.profilePic;

    if (req.file) {
        profilePic = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name, profilePic },
        { new: true, select: "-password" }
    );

    res.status(200).json({ user: updatedUser });
});


// this is used to verify the email address
export const verifyUserEmail = catchAsync(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new AppError("Token is required", 400);
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new AppError("Invalid or expired token!", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new AppError("User not found!", 404);
    }

    if (user.isVerified) {
        throw new AppError("Email already verified!", 400);
    }

    user.isVerified = true;
    await user.save();

    res.status(200).render("UserEmailVerify");
});

// Logout user
export const logoutUser = catchAsync(async (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/api/auth",
    });

    res.status(200).json({ message: "Logged out successfully" });
});



// Fetch all users
export const getAllUsers = catchAsync(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new AppError("Access denied. Admin privileges required.", 403);
    }

    const admin = await Admin.findById(req.user.id).select("course");
    if (!admin) {
        throw new AppError("Admin not found.", 404);
    }

    if (!admin.course) {
        return res.status(200).json({ users: [], count: 0 });
    }

    const escapedCourse = admin.course.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
        course: { $regex: `^${escapedCourse}$`, $options: "i" },
    }).select("-password");

    res.status(200).json({
        users,
        count: users.length,
    });
});