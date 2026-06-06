import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
    {
        year: { type: Number, required: true, unique: true },
        startYear: { type: Number, required: true },
        endYear: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", SessionSchema);
export default Session;
