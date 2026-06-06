import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Testing: allow only 2 login attempts per 15 minutes per IP
  message: {
    status: "fail",
    message: "Too many login attempts from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatbotRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    status: "fail",
    message: "Too many chatbot requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});