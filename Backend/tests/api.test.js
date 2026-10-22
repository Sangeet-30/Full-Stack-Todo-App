const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const todoItemController = require("../controllers/todoItemController");
const errorsController = require("../controllers/errors");
const requireAuth = require("../middleware/requireAuth");
const TodoItem = require("../models/todoItem");

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      return this;
    },
  };
  return res;
};

const getOffsetDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayStr = getOffsetDateString(0);
const tomorrowStr = getOffsetDateString(1);
const yesterdayStr = getOffsetDateString(-1);
const futureStr = getOffsetDateString(7);
const mockUserId = new mongoose.Types.ObjectId().toString();

// Task Input Validation Tests
test("Validation: createTodoItem rejects empty task", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "   ", date: todayStr } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Task description cannot be empty.");
});

test("Validation: createTodoItem rejects non-string task", async () => {
  const req = { session: { userId: mockUserId }, body: { task: 12345, date: todayStr } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Task description must be a string.");
});

test("Validation: createTodoItem rejects task exceeding 300 characters", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "a".repeat(301), date: todayStr } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Task description cannot exceed 300 characters.");
});

// Date Input Validation Tests
test("Validation: createTodoItem rejects missing date", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "Valid task" } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Due date is required.");
});

test("Validation: createTodoItem rejects empty date string", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "Valid task", date: "   " } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Due date cannot be empty.");
});

test("Validation: createTodoItem rejects invalid date format", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "Valid task", date: "not-a-valid-date" } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid date format provided.");
});

test("Validation: createTodoItem rejects impossible calendar date", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "Valid task", date: "2026-02-30" } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid date format provided.");
});

test("Validation: createTodoItem rejects yesterday's past date", async () => {
  const req = { session: { userId: mockUserId }, body: { task: "Valid task", date: yesterdayStr } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.createTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Due date cannot be in the past/);
});

test("Validation: createTodoItem accepts today's date and preserves calendar date", async () => {
  const originalSave = TodoItem.prototype.save;
  TodoItem.prototype.save = async function () {
    return this;
  };

  try {
    const req = { session: { userId: mockUserId }, body: { task: "Task due today", date: todayStr } };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.createTodoItem(req, res, next);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.task, "Task due today");
    assert.equal(res.body.user.toString(), mockUserId);
    assert.equal(res.body.date.toISOString().slice(0, 10), todayStr);
  } finally {
    TodoItem.prototype.save = originalSave;
  }
});

test("Validation: createTodoItem accepts ISO timestamp for today", async () => {
  const originalSave = TodoItem.prototype.save;
  TodoItem.prototype.save = async function () {
    return this;
  };

  try {
    const req = {
      session: { userId: mockUserId },
      body: { task: "Task with ISO date", date: `${todayStr}T00:00:00.000Z` },
    };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.createTodoItem(req, res, next);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.date.toISOString().slice(0, 10), todayStr);
  } finally {
    TodoItem.prototype.save = originalSave;
  }
});

test("Validation: createTodoItem accepts tomorrow's date", async () => {
  const originalSave = TodoItem.prototype.save;
  TodoItem.prototype.save = async function () {
    return this;
  };

  try {
    const req = { session: { userId: mockUserId }, body: { task: "Task due tomorrow", date: tomorrowStr } };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.createTodoItem(req, res, next);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.date.toISOString().slice(0, 10), tomorrowStr);
  } finally {
    TodoItem.prototype.save = originalSave;
  }
});

test("Validation: createTodoItem accepts a future date", async () => {
  const originalSave = TodoItem.prototype.save;
  TodoItem.prototype.save = async function () {
    return this;
  };

  try {
    const req = { session: { userId: mockUserId }, body: { task: "Task due next week", date: futureStr } };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.createTodoItem(req, res, next);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.task, "Task due next week");
    assert.equal(res.body.date.toISOString().slice(0, 10), futureStr);
  } finally {
    TodoItem.prototype.save = originalSave;
  }
});

// Update Date Validation Tests
test("Validation: updateTodoItem rejects missing date", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const req = { session: { userId: mockUserId }, params: { id: validId }, body: { task: "Updated task" } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.updateTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Due date is required.");
});

test("Validation: updateTodoItem rejects invalid date format", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const req = {
    session: { userId: mockUserId },
    params: { id: validId },
    body: { task: "Updated task", date: "invalid-date" },
  };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.updateTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid date format provided.");
});

test("Validation: updateTodoItem rejects editing to a past date", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const req = {
    session: { userId: mockUserId },
    params: { id: validId },
    body: { task: "Updated task", date: yesterdayStr },
  };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.updateTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Due date cannot be in the past/);
});

test("Validation: updateTodoItem accepts today or future date", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const mockTodo = {
    _id: validId,
    user: mockUserId,
    task: "Old task",
    date: null,
    completed: false,
    save: async function () {
      return this;
    },
  };

  const originalFindOne = TodoItem.findOne;
  TodoItem.findOne = async () => mockTodo;

  try {
    const req = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { task: "New task updated", date: futureStr },
    };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.updateTodoItem(req, res, next);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.task, "New task updated");
  } finally {
    TodoItem.findOne = originalFindOne;
  }
});

test("Validation: updateTodoItem rejects editing a completed task", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const mockCompletedTodo = {
    _id: validId,
    user: mockUserId,
    task: "Completed task",
    date: todayStr,
    completed: true,
    save: async function () {
      return this;
    },
  };

  const originalFindOne = TodoItem.findOne;
  TodoItem.findOne = async () => mockCompletedTodo;

  try {
    const req = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { task: "Attempted edit", date: futureStr },
    };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.updateTodoItem(req, res, next);
    assert.equal(res.statusCode, 400);
    assert.equal(
      res.body.message,
      "Completed tasks cannot be edited. Mark the task as incomplete to edit.",
    );
  } finally {
    TodoItem.findOne = originalFindOne;
  }
});

test("Validation: marking completed task incomplete enables editing again", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const mockTodo = {
    _id: validId,
    user: mockUserId,
    task: "Task to toggle",
    date: todayStr,
    completed: true,
    save: async function () {
      return this;
    },
  };

  const originalFindOne = TodoItem.findOne;
  TodoItem.findOne = async () => mockTodo;

  try {
    // 1. Verify editing rejected while completed
    const reqEdit1 = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { task: "Attempt while completed", date: futureStr },
    };
    const resEdit1 = createMockRes();
    await todoItemController.updateTodoItem(reqEdit1, resEdit1, () => {});
    assert.equal(resEdit1.statusCode, 400);

    // 2. Mark task incomplete
    const reqToggle = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { completed: false },
    };
    const resToggle = createMockRes();
    await todoItemController.markCompleted(reqToggle, resToggle, () => {});
    assert.equal(resToggle.statusCode, 200);
    assert.equal(resToggle.body.completed, false);
    mockTodo.completed = false;

    // 3. Editing is now allowed
    const reqEdit2 = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { task: "Edit after marked incomplete", date: futureStr },
    };
    const resEdit2 = createMockRes();
    await todoItemController.updateTodoItem(reqEdit2, resEdit2, () => {});
    assert.equal(resEdit2.statusCode, 200);
    assert.equal(resEdit2.body.task, "Edit after marked incomplete");
  } finally {
    TodoItem.findOne = originalFindOne;
  }
});

// ID Validation Tests
test("Validation: updateTodoItem rejects invalid ObjectId", async () => {
  const req = { session: { userId: mockUserId }, params: { id: "invalid-id" }, body: { task: "Valid task", date: todayStr } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.updateTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid todo ID format.");
});

test("Validation: deleteTodoItem rejects invalid ObjectId", async () => {
  const req = { session: { userId: mockUserId }, params: { id: "not-an-objectid" } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.deleteTodoItem(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid todo ID format.");
});

test("Validation: markCompleted rejects invalid ObjectId", async () => {
  const req = { session: { userId: mockUserId }, params: { id: "bad-id" }, body: { completed: true } };
  const res = createMockRes();
  const next = () => {};

  await todoItemController.markCompleted(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid todo ID format.");
});

test("Errors Controller: get404 responds with 404 JSON", () => {
  const req = { method: "GET", originalUrl: "/api/unknown-endpoint" };
  const res = createMockRes();
  const next = () => {};

  errorsController.get404(req, res, next);
  assert.equal(res.statusCode, 404);
  assert.match(res.body.message, /Resource not found/);
});

// Authorization & Model CRUD Tests
test("Authorization: requireAuth rejects unauthenticated requests with 401", () => {
  const req = { session: {} };
  const res = createMockRes();
  let calledNext = false;

  requireAuth(req, res, () => {
    calledNext = true;
  });

  assert.equal(calledNext, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Authentication required/);
});

test("Authorization: requireAuth allows authenticated requests through", () => {
  const req = { session: { userId: mockUserId } };
  const res = createMockRes();
  let calledNext = false;

  requireAuth(req, res, () => {
    calledNext = true;
  });

  assert.equal(calledNext, true);
});

test("Authorization: getTodoItems filters strictly by authenticated user ID", async () => {
  const mockItems = [
    { _id: new mongoose.Types.ObjectId(), user: mockUserId, task: "User's task", completed: false },
  ];

  let queryFilter = null;
  const originalFind = TodoItem.find;
  TodoItem.find = (filter) => {
    queryFilter = filter;
    return {
      sort: async () => mockItems,
    };
  };

  try {
    const req = { session: { userId: mockUserId } };
    const res = createMockRes();
    await todoItemController.getTodoItems(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepEqual(queryFilter, { user: mockUserId });
    assert.equal(res.body.length, 1);
  } finally {
    TodoItem.find = originalFind;
  }
});

test("Authorization: User A cannot read, update, or delete User B's todo", async () => {
  const userAId = new mongoose.Types.ObjectId().toString();
  const todoIdOfUserB = new mongoose.Types.ObjectId().toString();

  const originalFindOne = TodoItem.findOne;
  const originalFindOneAndDelete = TodoItem.findOneAndDelete;

  // Simulate database lookup where todo belongs to User B, not User A
  TodoItem.findOne = async (query) => {
    if (query.user === userAId) return null;
    return { _id: todoIdOfUserB, user: "user-B-id", task: "Secret task" };
  };
  TodoItem.findOneAndDelete = async (query) => {
    if (query.user === userAId) return null;
    return { _id: todoIdOfUserB };
  };

  try {
    const req = {
      session: { userId: userAId },
      params: { id: todoIdOfUserB },
      body: { task: "Hacked title", date: futureStr },
    };

    // Attempt update
    const resUpdate = createMockRes();
    await todoItemController.updateTodoItem(req, resUpdate, () => {});
    assert.equal(resUpdate.statusCode, 404);
    assert.equal(resUpdate.body.message, "Todo item not found.");

    // Attempt delete
    const resDelete = createMockRes();
    await todoItemController.deleteTodoItem(req, resDelete, () => {});
    assert.equal(resDelete.statusCode, 404);
    assert.equal(resDelete.body.message, "Todo item not found.");
  } finally {
    TodoItem.findOne = originalFindOne;
    TodoItem.findOneAndDelete = originalFindOneAndDelete;
  }
});

test("CRUD: deleteTodoItem returns 404 when item does not exist", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const originalFindOneAndDelete = TodoItem.findOneAndDelete;
  TodoItem.findOneAndDelete = async () => null;

  try {
    const req = { session: { userId: mockUserId }, params: { id: validId } };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.deleteTodoItem(req, res, next);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, "Todo item not found.");
  } finally {
    TodoItem.findOneAndDelete = originalFindOneAndDelete;
  }
});

test("CRUD: deleteTodoItem returns 204 when item is successfully deleted", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const originalFindOneAndDelete = TodoItem.findOneAndDelete;
  TodoItem.findOneAndDelete = async () => ({ _id: validId, task: "Deleted item" });

  try {
    const req = { session: { userId: mockUserId }, params: { id: validId } };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.deleteTodoItem(req, res, next);
    assert.equal(res.statusCode, 204);
  } finally {
    TodoItem.findOneAndDelete = originalFindOneAndDelete;
  }
});

test("CRUD: updateTodoItem returns 404 when item does not exist", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const originalFindOne = TodoItem.findOne;
  TodoItem.findOne = async () => null;

  try {
    const req = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { task: "Updated task", date: futureStr },
    };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.updateTodoItem(req, res, next);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, "Todo item not found.");
  } finally {
    TodoItem.findOne = originalFindOne;
  }
});

test("CRUD: markCompleted updates completed boolean", async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const mockTodo = {
    _id: validId,
    user: mockUserId,
    task: "Complete me",
    completed: false,
    save: async function () {
      return this;
    },
  };

  const originalFindOne = TodoItem.findOne;
  TodoItem.findOne = async () => mockTodo;

  try {
    const req = {
      session: { userId: mockUserId },
      params: { id: validId },
      body: { completed: true },
    };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.markCompleted(req, res, next);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.completed, true);
  } finally {
    TodoItem.findOne = originalFindOne;
  }
});

test("CRUD: deleteCompletedTodoItems removes only current user's completed tasks", async () => {
  let deleteFilter = null;
  const originalDeleteMany = TodoItem.deleteMany;
  TodoItem.deleteMany = async (filter) => {
    deleteFilter = filter;
    return { deletedCount: 3 };
  };

  try {
    const req = { session: { userId: mockUserId } };
    const res = createMockRes();
    const next = () => {};

    await todoItemController.deleteCompletedTodoItems(req, res, next);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.deletedCount, 3);
    assert.deepEqual(deleteFilter, { user: mockUserId, completed: true });
  } finally {
    TodoItem.deleteMany = originalDeleteMany;
  }
});
