const notesWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: {
    status: "fail",
    message: "Too many note write requests. Slow down and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});