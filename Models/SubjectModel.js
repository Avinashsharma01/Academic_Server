import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Data Structures"
        code: { type: String, default: "" }, // e.g., "CS201"
        branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
        semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    },
    { timestamps: true }
);

SubjectSchema.index({ name: 1, branch: 1, semester: 1 }, { unique: true });

const Subject = mongoose.model("Subject", SubjectSchema);
export default Subject;
