import mongoose from "mongoose";

const SemesterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "Semester 1"
        number: { type: Number, required: true }, // e.g., 1
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    },
    { timestamps: true }
);

SemesterSchema.index({ number: 1, course: 1 }, { unique: true });

const Semester = mongoose.model("Semester", SemesterSchema);
export default Semester;
