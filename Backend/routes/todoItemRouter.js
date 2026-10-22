const express = require("express");
const todoItemRouter = express.Router();
const todoItemController = require("../controllers/todoItemController");
const requireAuth = require("../middleware/requireAuth");

// Guard all todo operations with authentication middleware
todoItemRouter.use(requireAuth);

// Todo CRUD routes
todoItemRouter.get("/", todoItemController.getTodoItems);
todoItemRouter.post("/", todoItemController.createTodoItem);
todoItemRouter.delete("/completed", todoItemController.deleteCompletedTodoItems);
todoItemRouter.patch("/:id", todoItemController.updateTodoItem);
todoItemRouter.delete("/:id", todoItemController.deleteTodoItem);
todoItemRouter.put("/:id/completed", todoItemController.markCompleted);

module.exports = todoItemRouter;
