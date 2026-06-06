import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "CSE"
        fullName: { type: String, default: "" }, // e.g., "Computer Science & Engineering"
        code: { type: String, required: true, lowercase: true }, // e.g., "cse"
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    },
    { timestamps: true }
);

// compound unique index: same branch name can exist in different courses
BranchSchema.index({ name: 1, course: 1 }, { unique: true });

const Branch = mongoose.model("Branch", BranchSchema);
export default Branch;
