import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true }, // Rating (1 to 5 stars)
    },
    { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

// // i have done this becouse i want to add both admin and user at once

// import mongoose from "mongoose";

// const feedbackSchema = new mongoose.Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//             refPath: "userModel", // Dynamic reference based on the value of `userModel`
//         },
//         userModel: {
//             type: String,
//             required: true,
//             enum: ["User", "Admin"], // Only allow "User" or "Admin" as values
//         },
//         message: { type: String, required: true },
//         rating: { type: Number, min: 1, max: 5, required: true }, // Rating (1 to 5 stars)
//     },
//     { timestamps: true }
// );

// const Feedback = mongoose.model("Feedback", feedbackSchema);
// export default Feedback;








