// Core Modules
require("dotenv").config();

// External Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStoreModule = require("connect-mongo");
const MongoStore = MongoStoreModule.default || MongoStoreModule.MongoStore || MongoStoreModule;

// Local Modules
const authRouter = require("./routes/authRouter");
const todoItemRouter = require("./routes/todoItemRouter");
const errorsController = require("./controllers/errors");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/todo_app";
const isProduction = process.env.NODE_ENV === "production";
const isTest =
  process.env.NODE_ENV === "test" ||
  process.env.npm_lifecycle_event === "test" ||
  process.argv.includes("--test") ||
  process.execArgv.includes("--test");

// Enforce strong session secret in production
if (isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  console.error("SESSION_SECRET must be set to a secure string (at least 32 characters) in production.");
  if (require.main === module) process.exit(1);
}

// Trust reverse proxy (Render, Vercel, Nginx)
if (isProduction) {
  app.set("trust proxy", 1);
}

// CORS Configuration
const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const rawCorsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = rawCorsOrigin
  ? rawCorsOrigin.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, origin || true);
      } else {
        callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed.`));
      }
    },
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Store Configuration
let sessionStore;
if (!isTest) {
  try {
    sessionStore = MongoStore.create({
      mongoUrl: MONGO_URL,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  } catch (err) {
    console.error("MongoDB Session Store error:", err.message);
    if (isProduction && require.main === module) {
      process.exit(1);
    }
  }
}

// Session Middleware
app.use(
  session({
    name: "todo_flow.sid",
    secret: process.env.SESSION_SECRET || "dev_fallback_session_secret_please_set_in_production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    },
  }),
);

// Health Check and Root Diagnostics
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Todo App Backend API",
    version: "2.0.0",
  });
});

app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "healthy" : "unhealthy",
    database: isConnected ? "connected" : "disconnected",
  });
});

// Authentication Routes
app.use("/api/auth", authRouter);

// Protected Todo Routes
app.use("/api/todo", todoItemRouter);

// 404 Not Found Middleware
app.use(errorsController.get404);

// Centralized Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS policy violation")) {
    return res.status(403).json({ message: err.message });
  }

  console.error("Server Error:", err.message);
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    message: err.message || "An unexpected internal server error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Server Initialization
if (require.main === module) {
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("Connected to MongoDB successfully");
      const server = app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });

      const handleShutdown = () => {
        console.log("\nGracefully shutting down server...");
        server.close(async () => {
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      };

      process.on("SIGINT", handleShutdown);
      process.on("SIGTERM", handleShutdown);
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = app;
