const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");

const authRouter = express.Router();

// Rate limiter for authentication attempts (15 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

authRouter.post("/register", authLimiter, authController.register);
authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authController.getMe);

module.exports = authRouter;

