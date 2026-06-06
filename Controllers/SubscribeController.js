import Subscribe from "../Models/SubscribedEmailModel.js";

// Subscribe user email to newsletter
const subscribeEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if email already exists
        const existingSubscription = await Subscribe.findOne({ email });
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "Email is already subscribed"
            });
        }

        // Create new subscription
        const newSubscription = await Subscribe.create({ email });

        res.status(201).json({
            success: true,
            message: "Successfully subscribed to newsletter",
            subscription: newSubscription
        });
    } catch (error) {
        console.error("Error in subscribe controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to subscribe, please try again later",
            error: error.message
        });
    }
};

// Get all subscribers (admin only)
const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscribe.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subscribers.length,
            subscribers
        });
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscribers",
            error: error.message
        });
    }
};

// Delete a subscriber (admin only)
const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Subscribe.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Subscriber not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subscriber removed successfully"
        });
    } catch (error) {
        console.error("Error deleting subscriber:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete subscriber",
            error: error.message
        });
    }
};

// Unsubscribe from newsletter (user)
const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const result = await Subscribe.findOneAndDelete({ email });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Email not found in subscriber list"
            });
        }

        res.status(200).json({
            success: true,
            message: "Successfully unsubscribed from newsletter"
        });
    } catch (error) {
        console.error("Error in unsubscribe controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unsubscribe, please try again later",
            error: error.message
        });
    }
};

export { subscribeEmail, getAllSubscribers, deleteSubscriber, unsubscribe };



