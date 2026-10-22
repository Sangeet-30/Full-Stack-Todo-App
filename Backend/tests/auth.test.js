const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const authController = require("../controllers/authController");
const User = require("../models/user");

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    cookiesCleared: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    clearCookie(name) {
      this.cookiesCleared.push(name);
      return this;
    },
  };
  return res;
};

// Registration Validation Tests
test("Auth Validation: register rejects short name", async () => {
  const req = {
    body: {
      name: "A",
      email: "test@example.com",
      password: "Password123",
      passwordConfirmation: "Password123",
    },
  };
  const res = createMockRes();

  await authController.register(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Name must be at least 2 characters/);
});

test("Auth Validation: register rejects invalid email", async () => {
  const req = {
    body: {
      name: "Valid Name",
      email: "not-an-email",
      password: "Password123",
      passwordConfirmation: "Password123",
    },
  };
  const res = createMockRes();

  await authController.register(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /valid email address/);
});

test("Auth Validation: register rejects password without number", async () => {
  const req = {
    body: {
      name: "Valid Name",
      email: "valid@example.com",
      password: "PasswordOnlyLetters",
      passwordConfirmation: "PasswordOnlyLetters",
    },
  };
  const res = createMockRes();

  await authController.register(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /at least one letter and one number/);
});

test("Auth Validation: register rejects password confirmation mismatch", async () => {
  const req = {
    body: {
      name: "Valid Name",
      email: "valid@example.com",
      password: "Password123",
      passwordConfirmation: "DifferentPassword123",
    },
  };
  const res = createMockRes();

  await authController.register(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Passwords do not match.");
});

test("Auth Registration: rejects duplicate email address with 409", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({ _id: "existing-user-id", email: "used@example.com" });

  try {
    const req = {
      body: {
        name: "Second User",
        email: "used@example.com",
        password: "Password123",
        passwordConfirmation: "Password123",
      },
    };
    const res = createMockRes();

    await authController.register(req, res, () => {});
    assert.equal(res.statusCode, 409);
    assert.match(res.body.message, /already exists/);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Auth Registration: creates user without authenticating session", async () => {
  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;

  User.findOne = async () => null; // Email available
  User.prototype.save = async function () {
    this._id = new mongoose.Types.ObjectId();
    return this;
  };

  try {
    const req = {
      session: {},
      body: {
        name: "Jane Doe",
        email: "JANE.DOE@example.com", // Test uppercase normalization
        password: "SecurePassword1",
        passwordConfirmation: "SecurePassword1",
      },
    };
    const res = createMockRes();

    await authController.register(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.user.name, "Jane Doe");
    assert.equal(res.body.user.email, "jane.doe@example.com"); // Normalized
    assert.equal(res.body.user.passwordHash, undefined); // Never exposed
    assert.equal(res.body.message, "Account created successfully. Please log in.");
    assert.equal(req.session.userId, undefined); // NOT authenticated
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
  }
});

test("Auth Registration: regenerates session on registration without establishing authenticated user", async () => {
  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;

  User.findOne = async () => null;
  User.prototype.save = async function () {
    this._id = new mongoose.Types.ObjectId();
    return this;
  };

  let regenerated = false;
  try {
    const req = {
      session: {
        regenerate: (cb) => {
          regenerated = true;
          cb(null);
        },
      },
      body: {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "SecurePassword1",
        passwordConfirmation: "SecurePassword1",
      },
    };
    const res = createMockRes();

    await authController.register(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(regenerated, true);
    assert.equal(req.session.userId, undefined); // NOT authenticated
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
  }
});

test("Auth Flow: /api/auth/me returns 401 after registration until login succeeds", async () => {
  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const originalSave = User.prototype.save;

  const mockUserId = new mongoose.Types.ObjectId();
  const mockHashedPassword = await bcrypt.hash("SecurePassword1", 10);
  let savedUserDoc = null;

  User.findOne = async ({ email }) => {
    if (savedUserDoc && savedUserDoc.email === email) {
      return savedUserDoc;
    }
    return null;
  };
  User.findById = async (id) => {
    if (savedUserDoc && savedUserDoc._id.toString() === id.toString()) {
      return savedUserDoc;
    }
    return null;
  };
  User.prototype.save = async function () {
    this._id = mockUserId;
    savedUserDoc = this;
    savedUserDoc.comparePassword = async (candidate) => {
      return bcrypt.compare(candidate, mockHashedPassword);
    };
    return this;
  };

  try {
    const sessionObj = {};

    // 1. Register
    const regReq = {
      session: sessionObj,
      body: {
        name: "Flow User",
        email: "flow@example.com",
        password: "SecurePassword1",
        passwordConfirmation: "SecurePassword1",
      },
    };
    const regRes = createMockRes();
    await authController.register(regReq, regRes, () => {});
    assert.equal(regRes.statusCode, 201);
    assert.equal(sessionObj.userId, undefined);

    // 2. /api/auth/me returns 401 immediately after registration
    const meReqBefore = { session: sessionObj };
    const meResBefore = createMockRes();
    await authController.getMe(meReqBefore, meResBefore, () => {});
    assert.equal(meResBefore.statusCode, 401);

    // 3. Login with newly registered credentials
    const loginReq = {
      session: sessionObj,
      body: {
        email: "flow@example.com",
        password: "SecurePassword1",
      },
    };
    const loginRes = createMockRes();
    await authController.login(loginReq, loginRes, () => {});
    assert.equal(loginRes.statusCode, 200);
    assert.equal(sessionObj.userId, mockUserId.toString());

    // 4. /api/auth/me returns 200 after login
    const meReqAfter = { session: sessionObj };
    const meResAfter = createMockRes();
    await authController.getMe(meReqAfter, meResAfter, () => {});
    assert.equal(meResAfter.statusCode, 200);
    assert.equal(meResAfter.body.user.email, "flow@example.com");
  } finally {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
    User.prototype.save = originalSave;
  }
});

test("Auth Registration: handles regeneration error and aborts with error", async () => {
  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;

  User.findOne = async () => null;
  User.prototype.save = async function () {
    this._id = new mongoose.Types.ObjectId();
    return this;
  };

  let passedError = null;
  try {
    const req = {
      session: {
        regenerate: (cb) => {
          cb(new Error("Regeneration failed"));
        },
      },
      body: {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "SecurePassword1",
        passwordConfirmation: "SecurePassword1",
      },
    };
    const res = createMockRes();

    await authController.register(req, res, (err) => {
      passedError = err;
    });
    assert.equal(res.body, null);
    assert.ok(passedError);
    assert.equal(passedError.message, "Regeneration failed");
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
  }
});

// Login Tests
test("Auth Login: rejects missing email or password", async () => {
  const req = { body: { email: "", password: "" } };
  const res = createMockRes();

  await authController.login(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Email and password are required.");
});

test("Auth Login: rejects whitespace-only email with 400", async () => {
  const req = { body: { email: "   ", password: "ValidPassword123" } };
  const res = createMockRes();

  await authController.login(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Email and password are required.");
});

test("Auth Login: rejects whitespace-only password with 400", async () => {
  const req = { body: { email: "test@example.com", password: "   " } };
  const res = createMockRes();

  await authController.login(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Email and password are required.");
});

test("Auth Login: rejects missing email field with 400", async () => {
  const req = { body: { password: "ValidPassword123" } };
  const res = createMockRes();

  await authController.login(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Email and password are required.");
});

test("Auth Login: rejects missing password field with 400", async () => {
  const req = { body: { email: "test@example.com" } };
  const res = createMockRes();

  await authController.login(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Email and password are required.");
});

test("Auth Login: rejects non-existent user with generic 401 and clears session userId", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => null;

  try {
    const sessionObj = { userId: "stale-session-id" };
    const req = {
      session: sessionObj,
      body: { email: "ghost@example.com", password: "Password123" },
    };
    const res = createMockRes();

    await authController.login(req, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Invalid email or password.");
    assert.equal(sessionObj.userId, undefined);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Auth Login: rejects wrong password with generic 401 and clears session userId", async () => {
  const originalFindOne = User.findOne;
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: "user@example.com",
    comparePassword: async () => false,
  };
  User.findOne = async () => mockUser;

  try {
    const sessionObj = { userId: "stale-session-id" };
    const req = {
      session: sessionObj,
      body: { email: "user@example.com", password: "WrongPassword" },
    };
    const res = createMockRes();

    await authController.login(req, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Invalid email or password.");
    assert.equal(sessionObj.userId, undefined);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Auth Login: successfully logs in, regenerates session, and sets userId", async () => {
  const originalFindOne = User.findOne;
  const mockUserId = new mongoose.Types.ObjectId();
  const mockUser = {
    _id: mockUserId,
    name: "Alex Smith",
    email: "alex@example.com",
    comparePassword: async () => true,
    toJSON: () => ({ id: mockUserId.toString(), name: "Alex Smith", email: "alex@example.com" }),
  };
  User.findOne = async () => mockUser;

  let regenerated = false;
  const req = {
    session: {
      userId: "old-anonymous-id",
      regenerate: (cb) => {
        regenerated = true;
        cb(null);
      },
    },
    body: { email: "alex@example.com", password: "ValidPassword1" },
  };
  const res = createMockRes();

  try {
    await authController.login(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(regenerated, true);
    assert.equal(req.session.userId, mockUserId.toString());
    assert.equal(res.body.user.name, "Alex Smith");
  } finally {
    User.findOne = originalFindOne;
  }
});

// Logout Tests
test("Auth Logout: destroys session and clears cookie", async () => {
  let destroyed = false;
  const req = {
    session: {
      userId: "user-id",
      destroy: (cb) => {
        destroyed = true;
        cb(null);
      },
    },
  };
  const res = createMockRes();

  await authController.logout(req, res, () => {});
  assert.equal(res.statusCode, 200);
  assert.equal(destroyed, true);
  assert.equal(res.cookiesCleared.length, 1);
  assert.equal(res.cookiesCleared[0], "todo_flow.sid");
});

// Current User (/me) Tests
test("Auth Me: returns 401 when unauthenticated", async () => {
  const req = { session: {} };
  const res = createMockRes();

  await authController.getMe(req, res, () => {});
  assert.equal(res.statusCode, 401);
});

test("Auth Me: returns safe user profile when authenticated", async () => {
  const originalFindById = User.findById;
  const mockUserId = new mongoose.Types.ObjectId();
  const mockUser = {
    _id: mockUserId,
    name: "Current User",
    email: "current@example.com",
    toJSON: () => ({
      id: mockUserId.toString(),
      name: "Current User",
      email: "current@example.com",
    }),
  };
  User.findById = async () => mockUser;

  try {
    const req = { session: { userId: mockUserId.toString() } };
    const res = createMockRes();

    await authController.getMe(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.email, "current@example.com");
    assert.equal(res.body.user.passwordHash, undefined);
  } finally {
    User.findById = originalFindById;
  }
});

// HTTP Integration Tests (Testing express app with real HTTP requests and no cookies)
const http = require("node:http");
const app = require("../app");

test("HTTP Integration: unauthenticated client GET /api/auth/me returns 401", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.message, "Not authenticated.");
  } finally {
    server.close();
  }
});

test("HTTP Integration: empty credentials login returns 400 Bad Request", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.message, "Email and password are required.");
  } finally {
    server.close();
  }
});

test("HTTP Integration: whitespace-only credentials login returns 400 Bad Request", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "   ", password: "   " }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.message, "Email and password are required.");
  } finally {
    server.close();
  }
});

test("HTTP Integration: invalid credentials login returns 401 Unauthorized", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const originalFindOne = User.findOne;
  User.findOne = async () => null;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unknown@example.com", password: "WrongPassword123" }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.message, "Invalid email or password.");
  } finally {
    User.findOne = originalFindOne;
    server.close();
  }
});

test("HTTP Integration: signup followed by /api/auth/me returns 401 Unauthorized", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;
  const mockUserId = new mongoose.Types.ObjectId();

  User.findOne = async () => null;
  User.prototype.save = async function () {
    this._id = mockUserId;
    return this;
  };

  try {
    const regRes = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Register",
        email: "testreg@example.com",
        password: "ValidPassword1",
        passwordConfirmation: "ValidPassword1",
      }),
    });
    assert.equal(regRes.status, 201);

    const cookie = regRes.headers.get("set-cookie");

    // Check /api/auth/me with any cookie returned
    const meRes = await fetch(`http://localhost:${port}/api/auth/me`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert.equal(meRes.status, 401);
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
    server.close();
  }
});

test("HTTP Integration: unauthenticated requests to all Todo endpoints return 401", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const fakeId = new mongoose.Types.ObjectId().toString();

  try {
    const endpoints = [
      { method: "GET", path: "/api/todo" },
      { method: "POST", path: "/api/todo", body: { task: "Task", date: "2026-12-31" } },
      { method: "PATCH", path: `/api/todo/${fakeId}`, body: { task: "Updated" } },
      { method: "DELETE", path: `/api/todo/${fakeId}` },
      { method: "PUT", path: `/api/todo/${fakeId}/completed`, body: { completed: true } },
      { method: "DELETE", path: "/api/todo/completed" },
    ];

    for (const ep of endpoints) {
      const res = await fetch(`http://localhost:${port}${ep.path}`, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        ...(ep.body && { body: JSON.stringify(ep.body) }),
      });
      assert.equal(
        res.status,
        401,
        `Expected ${ep.method} ${ep.path} to return 401 without auth, got ${res.status}`
      );
      const data = await res.json();
      assert.equal(data.message, "Authentication required to access this resource.");
    }
  } finally {
    server.close();
  }
});

test("HTTP Integration: client-supplied userId never bypasses requireAuth", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const spoofedUserId = new mongoose.Types.ObjectId().toString();

  try {
    const res = await fetch(`http://localhost:${port}/api/todo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": spoofedUserId,
        "userId": spoofedUserId,
      },
      body: JSON.stringify({
        userId: spoofedUserId,
        user: spoofedUserId,
        task: "Malicious Task",
        date: "2026-12-31",
      }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.message, "Authentication required to access this resource.");
  } finally {
    server.close();
  }
});

test("HTTP Integration: valid login grants access, logout revokes access", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const mockUserId = new mongoose.Types.ObjectId();
  const mockUser = {
    _id: mockUserId,
    name: "Valid User",
    email: "valid@example.com",
    comparePassword: async () => true,
    toJSON: () => ({ id: mockUserId.toString(), name: "Valid User", email: "valid@example.com" }),
  };

  User.findOne = async () => mockUser;
  User.findById = async () => mockUser;

  try {
    // 1. Login with valid credentials
    const loginRes = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "valid@example.com", password: "ValidPassword123" }),
    });
    assert.equal(loginRes.status, 200);

    const rawCookie = loginRes.headers.get("set-cookie");
    assert.ok(rawCookie, "Login should set session cookie");
    const sessionCookie = rawCookie.split(";")[0];

    // 2. Access /api/auth/me with session cookie
    const meRes = await fetch(`http://localhost:${port}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.user.email, "valid@example.com");

    // 3. Logout
    const logoutRes = await fetch(`http://localhost:${port}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    assert.equal(logoutRes.status, 200);

    // 4. Access /api/auth/me after logout -> should be 401
    const meAfterLogout = await fetch(`http://localhost:${port}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert.equal(meAfterLogout.status, 401);
  } finally {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
    server.close();
  }
});

