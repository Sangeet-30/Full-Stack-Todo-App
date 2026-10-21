const mongoose = require("mongoose");

const todoItemSchema = new mongoose.Schema(
  {
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
