import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        course: { type: String, default: "Not Specified" },
        branch: { type: String, default: "Not Specified" },
        enrollment: { type: Number, default: 0 },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for social auth users
        profilePic: { type: String, default: "" },
        isVerified: { type: Boolean, default: false },
        role: { type: String, enum: ["student", "admin"], default: "student" },
        authProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
        firebaseUid: { type: String, default: "" }, // Firebase UID for social auth users
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
