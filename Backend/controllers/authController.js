const bcrypt = require("bcryptjs");
const User = require("../models/user");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_NAME = "todo_flow.sid";
const isProduction = process.env.NODE_ENV === "production";
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const validateRegistrationInput = ({ name, email, password, passwordConfirmation }) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (name.trim().length > 50) {
    return "Name cannot exceed 50 characters.";
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }

  if (password !== passwordConfirmation) {
    return "Passwords do not match.";
  }

  return null;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirmation } = req.body;

    const validationError = validateRegistrationInput({
      name,
      email,
      password,
      passwordConfirmation,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    await user.save();

    const completeRegistration = () => {
      if (req.session) {
        delete req.session.userId;
      }
      res.clearCookie(COOKIE_NAME, CLEAR_COOKIE_OPTIONS);
      return res.status(201).json({
        message: "Account created successfully. Please log in.",
        user: user.toJSON(),
      });
    };

    if (req.session) {
      delete req.session.userId;
      if (typeof req.session.destroy === "function") {
        return req.session.destroy((err) => {
          if (err) {
            return next(err);
          }
          return completeRegistration();
        });
      }
      if (typeof req.session.regenerate === "function") {
        return req.session.regenerate((err) => {
          if (err) {
            return next(err);
          }
          if (req.session) {
            delete req.session.userId;
          }
          return completeRegistration();
        });
      }
    }

    return completeRegistration();
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      if (req.session) {
        delete req.session.userId;
      }
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      if (req.session) {
        delete req.session.userId;
      }
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const completeLogin = () => {
      req.session.userId = user._id.toString();
      return res.status(200).json({
        message: "Logged in successfully.",
        user: user.toJSON(),
      });
    };

    // Regenerate session ID on login to mitigate session fixation attacks
    if (req.session && typeof req.session.regenerate === "function") {
      req.session.regenerate((err) => {
        if (err) {
          return next(err);
        }
        return completeLogin();
      });
    } else {
      if (req.session) {
        req.session.userId = user._id.toString();
      }
      return completeLogin();
    }
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const finalizeLogout = () => {
      res.clearCookie(COOKIE_NAME, CLEAR_COOKIE_OPTIONS);
      return res.status(200).json({ message: "Logged out successfully." });
    };

    if (!req.session) {
      return finalizeLogout();
    }

    if (typeof req.session.destroy === "function") {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err.message);
        }
        return finalizeLogout();
      });
    } else {
      delete req.session.userId;
      return finalizeLogout();
    }
  } catch (error) {
    return next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      if (req.session && typeof req.session.destroy === "function") {
        req.session.destroy(() => {});
      }
      return res.status(401).json({ message: "User session expired or invalid." });
    }

    return res.status(200).json({
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

