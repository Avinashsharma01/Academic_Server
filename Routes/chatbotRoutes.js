import express from "express";
import { authenticateUser } from "../Middleware/authMiddleware.js";
import { chatbotRateLimiter } from "../Middleware/RateLimitter.js";
import { chatWithAssistant } from "../Controllers/chatbotController.js";

const router = express.Router();

router.post("/message", authenticateUser, chatbotRateLimiter, chatWithAssistant);

export default router;