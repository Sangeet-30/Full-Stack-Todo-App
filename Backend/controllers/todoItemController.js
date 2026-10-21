const mongoose = require("mongoose");
const TodoItem = require("../models/todoItem");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateTaskInput = (task) => {
  if (typeof task !== "string") {
    return "Task description must be a string.";
  }
  const trimmed = task.trim();
  if (trimmed.length === 0) {
    return "Task description cannot be empty.";
  }
  if (trimmed.length > 300) {
    return "Task description cannot exceed 300 characters.";
  }
  return null;
};

/**
 * Returns the current calendar date in local time as 'YYYY-MM-DD'.
 * Avoids UTC timezone conversion shifts.
 */
const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Validates and parses the due date:
 * - Date is mandatory (must not be undefined, null, or empty).
 * - Must be a valid format (YYYY-MM-DD or parseable ISO date).
 * - Stored as UTC midnight so that toISOString() retains the exact calendar date.
 * - Must not be earlier than today's local calendar date.
 */
const validateDateInput = (date) => {
  if (date === undefined || date === null) {
    return { valid: false, error: "Due date is required." };
  }

  if (typeof date === "string" && date.trim().length === 0) {
    return { valid: false, error: "Due date cannot be empty." };
  }

  let dateStr;
  let parsedDate;

  if (typeof date === "string") {
    const trimmed = date.trim();
    const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (ymdRegex.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      parsedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      if (
        parsedDate.getUTCFullYear() !== year ||
        parsedDate.getUTCMonth() !== month - 1 ||
        parsedDate.getUTCDate() !== day
      ) {
        return { valid: false, error: "Invalid date format provided." };
      }
      dateStr = trimmed;
    } else {
      const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const year = Number(isoMatch[1]);
        const month = Number(isoMatch[2]);
        const day = Number(isoMatch[3]);
        parsedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        if (
          parsedDate.getUTCFullYear() !== year ||
          parsedDate.getUTCMonth() !== month - 1 ||
          parsedDate.getUTCDate() !== day
        ) {
          return { valid: false, error: "Invalid date format provided." };
        }
        dateStr = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
      } else {
        return { valid: false, error: "Invalid date format provided." };
      }
    }
  } else if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      return { valid: false, error: "Invalid date format provided." };
    }
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
    parsedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  } else {
    return { valid: false, error: "Invalid date format provided." };
  }

  const todayStr = getLocalDateString();
  if (dateStr < todayStr) {
    return {
      valid: false,
      error: "Due date cannot be in the past. Please select today or a future date.",
    };
  }

  return { valid: true, value: parsedDate };
};

exports.getLocalDateString = getLocalDateString;
exports.validateDateInput = validateDateInput;

exports.createTodoItem = async (req, res, next) => {
  try {
    const { task, date } = req.body;

    const taskError = validateTaskInput(task);
    if (taskError) {
      return res.status(400).json({ message: taskError });
    }

    const dateResult = validateDateInput(date);
    if (!dateResult.valid) {
      return res.status(400).json({ message: dateResult.error });
    }

    const todoItem = new TodoItem({
      task: task.trim(),
      date: dateResult.value,
      completed: false,
    });

    await todoItem.save();
    return res.status(201).json(todoItem);
  } catch (error) {
    return next(error);
  }
};

exports.getTodoItems = async (req, res, next) => {
  try {
    const todoItems = await TodoItem.find().sort({ createdAt: -1 });
    return res.status(200).json(todoItems);
  } catch (error) {
    return next(error);
  }
};

exports.deleteTodoItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid todo ID format." });
    }

    const deletedItem = await TodoItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Todo item not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

exports.updateTodoItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { task, date } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid todo ID format." });
    }

    const taskError = validateTaskInput(task);
    if (taskError) {
      return res.status(400).json({ message: taskError });
    }

    const dateResult = validateDateInput(date);
    if (!dateResult.valid) {
      return res.status(400).json({ message: dateResult.error });
    }

    const todoItem = await TodoItem.findById(id);
    if (!todoItem) {
      return res.status(404).json({ message: "Todo item not found." });
    }

    if (todoItem.completed) {
      return res.status(400).json({
        message: "Completed tasks cannot be edited. Mark the task as incomplete to edit.",
      });
    }

    todoItem.task = task.trim();
    todoItem.date = dateResult.value;
    await todoItem.save();

    return res.status(200).json(todoItem);
  } catch (error) {
    return next(error);
  }
};

exports.deleteCompletedTodoItems = async (req, res, next) => {
  try {
    const result = await TodoItem.deleteMany({ completed: true });
    return res.status(200).json({
      message: "Completed todos removed successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return next(error);
  }
};

exports.markCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid todo ID format." });
    }

    const todoItem = await TodoItem.findById(id);
    if (!todoItem) {
      return res.status(404).json({ message: "Todo item not found." });
    }

    const isCompleted =
      typeof req.body.completed === "boolean"
        ? req.body.completed
        : req.body.completed === "true"
          ? true
          : req.body.completed === "false"
            ? false
            : true;

    todoItem.completed = isCompleted;
    await todoItem.save();

    return res.status(200).json(todoItem);
  } catch (error) {
    return next(error);
  }
};
