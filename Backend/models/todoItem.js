const mongoose = require("mongoose");

const todoItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    task: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: [300, "Task description cannot exceed 300 characters"],
    },
    date: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TodoItem", todoItemSchema);
