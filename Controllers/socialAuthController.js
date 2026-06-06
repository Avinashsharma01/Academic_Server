import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import firebaseAdmin from "../Config/firebaseAdmin.js";

// Social Login — Verify Firebase token and create/login user
export const socialLogin = async (req, res) => {
    try {
        const { idToken, provider } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Firebase ID token is required" });
        }

        // Verify the Firebase ID token
        let decodedToken;
        try {
            decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        } catch (firebaseError) {
            console.error("Firebase token verification failed:", firebaseError.code, firebaseError.message);
            return res.status(401).json({
                message: "Invalid or expired Firebase token",
                error: firebaseError.code || firebaseError.message,
            });
        }

        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({ message: "Email not provided by the social provider" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists — update Firebase UID and profile pic if not set
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                user.authProvider = provider || "google";
            }
            if (picture && !user.profilePic) {
                user.profilePic = picture;
            }
            await user.save();
        } else {
            // Create new user from social auth
            user = new User({
                name: name || email.split("@")[0],
                email,
                profilePic: picture || "",
                isVerified: true, // Social auth users are pre-verified
                role: "student",
                authProvider: provider || "google",
                firebaseUid: uid,
                course: "Not Specified",
                branch: "Not Specified",
                enrollment: 0,
            });
            await user.save();
        }

        // Generate JWT Token (same as regular login)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Set JWT as httpOnly cookie (same as regular login)
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: true, // Must be true for cross-site cookies
            sameSite: "none", // Must be "none" for cross-site requests
            path: "/",
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
                profilePic: user.profilePic,
                authProvider: user.authProvider,
            },
        });
    } catch (error) {
        console.error("Social login error:", error);
        res.status(500).json({ message: "Server error during social login" });
    }
};
