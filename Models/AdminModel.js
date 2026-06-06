import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "admin" },
        isVerified: { type: Boolean, default: false },
        course: { type: String, required: true }, // e.g., "B.Tech", "BCA"
        department: { type: String, default: "" }, // e.g., "CSE", "IT", "Civil"
        college: { type: String, default: "" }, // e.g., "ABC Engineering College"
        designation: { type: String, default: "" }, // e.g., "Professor", "HOD"
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
