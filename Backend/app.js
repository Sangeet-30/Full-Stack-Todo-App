// Core Module
require("dotenv").config();

// External Module
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Local Modules
const todoItemRouter = require("./routes/totoItemRouter");
const errorsController = require("./controllers/errors");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URL = process.env.MONGO_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

app.use("/api/todo", todoItemRouter);

app.use(errorsController.get404);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
