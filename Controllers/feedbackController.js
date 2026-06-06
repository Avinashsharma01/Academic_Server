import Feedback from "../Models/Feedback.js";

// Submit Feedback
export const submitFeedback = async (req, res) => {
    try {
        const { message, rating } = req.body;
        const userId = req.user.id;

        if (!message || !rating) {
            return res.status(400).json({ message: "Message and rating are required" });
        }

        const feedback = new Feedback({ user: userId, message, rating });
        await feedback.save();

        res.status(201).json({ message: "Feedback submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get All Feedbacks (Admin Only)
export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("user", "name email");
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};



// Delete Feedback
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndDelete(id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};