// External Module
const express = require("express");
const todoItemRouter = express.Router();

// Local Module
const todoItemController = require("../controllers/todoItemController");

todoItemRouter.get("/", todoItemController.getTodoItems);
todoItemRouter.post("/", todoItemController.createTodoItem);
todoItemRouter.delete("/completed", todoItemController.deleteCompletedTodoItems);
todoItemRouter.patch("/:id", todoItemController.updateTodoItem);
todoItemRouter.delete("/:id", todoItemController.deleteTodoItem);
todoItemRouter.put("/:id/completed", todoItemController.markCompleted);

module.exports = todoItemRouter;
