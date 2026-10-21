// Core Modules
require("dotenv").config();

// External Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Local Modules
const todoItemRouter = require("./routes/todoItemRouter");
const errorsController = require("./controllers/errors");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/todo_app";

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((o) => o.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health Check and Root
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Todo App Backend API",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/todo", todoItemRouter);

// 404 Not Found Middleware
app.use(errorsController.get404);

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
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
