const TodoItem = require("../models/todoItem");

exports.createTodoItem = async (req, res, next) => {
  const { task, date } = req.body;
  if (typeof task !== "string" || !task.trim()) {
    return res.status(400).json({ message: "Task is required." });
  }

  const todoItem = new TodoItem({ task, date });
  await todoItem.save();
  res.status(201).json(todoItem);
};

exports.getTodoItems = async (req, res, next) => {
  const todoItems = await TodoItem.find();
  res.json(todoItems);
};

exports.deleteTodoItem = async (req, res, next) => {
  const { id } = req.params;
  await TodoItem.findByIdAndDelete(id);
  res.sendStatus(204);
};

exports.updateTodoItem = async (req, res, next) => {
  const { id } = req.params;
  const { task, date } = req.body;
  if (typeof task !== "string" || !task.trim()) {
    return res.status(400).json({ message: "Task is required." });
  }

  const todoItem = await TodoItem.findById(id);
  if (!todoItem) {
    return res.status(404).json({ message: "Todo item not found." });
  }

  todoItem.task = task.trim();
  todoItem.date = date;
  await todoItem.save();
  res.json(todoItem);
};

exports.deleteCompletedTodoItems = async (req, res, next) => {
  await TodoItem.deleteMany({ completed: true });
  res.sendStatus(204);
};

exports.markCompleted = async (req, res, next) => {
  const { id } = req.params;
  const todoItem = await TodoItem.findById(id);
  if (!todoItem) {
    return res.status(404).json({ message: "Todo item not found." });
  }

  todoItem.completed = req.body.completed ?? true;
  await todoItem.save();
  res.json(todoItem);
};
