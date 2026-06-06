import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // e.g., "B.Tech"
        description: { type: String, default: "" }, // e.g., "Bachelor of Technology"
        code: { type: String, required: true, unique: true, lowercase: true }, // e.g., "btech"
        icon: { type: String, default: "graduation-cap" },
        color: { type: String, default: "blue" },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    },
    { timestamps: true }
);

const Course = mongoose.model("Course", CourseSchema);
export default Course;
