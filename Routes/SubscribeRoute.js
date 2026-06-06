import express from "express";
import { subscribeEmail, getAllSubscribers, deleteSubscriber, unsubscribe } from "../Controllers/SubscribeController.js";
import { authorizeAdmin } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Public route - subscribe to newsletter
router.post("/", subscribeEmail);

// Public route - unsubscribe from newsletter
router.post("/unsubscribe", unsubscribe);

// Admin routes - protected
router.get("/all", authorizeAdmin, getAllSubscribers);
router.delete("/:id", authorizeAdmin, deleteSubscriber);

export default router;