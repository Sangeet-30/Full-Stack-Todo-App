import test from "node:test";
import assert from "node:assert/strict";
import { register, login, logout, getMe } from "../src/services/authService.js";

test("authService: handles register API network failure gracefully", async () => {
  // Mock global fetch to reject
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Network connection lost");
  };

  try {
    await assert.rejects(
      async () => {
        await register("Test User", "test@example.com", "Secret123!", "Secret123!");
      },
      {
        message: "Network connection lost",
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: handles register API validation error response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({
      success: false,
      error: "Validation failed",
      errors: ["Email is already in use"],
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await register("Test User", "dup@example.com", "Secret123!", "Secret123!");
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.equal(err.message, "Email is already in use");
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: register sends request with credentials and returns message", async () => {
  const originalFetch = globalThis.fetch;
  let capturedOptions = null;

  globalThis.fetch = async (url, options) => {
    capturedOptions = options;
    return {
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        message: "Account created successfully. Please log in.",
      }),
    };
  };

  try {
    const res = await register("New User", "new@example.com", "Password123!", "Password123!");
    assert.equal(res.success, true);
    assert.equal(res.message, "Account created successfully. Please log in.");
    assert.equal(capturedOptions.credentials, "include");
    assert.equal(capturedOptions.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: login includes credentials and returns payload", async () => {
  const originalFetch = globalThis.fetch;
  let capturedOptions = null;

  globalThis.fetch = async (url, options) => {
    capturedOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        user: { id: "123", name: "Alice", email: "alice@example.com" },
      }),
    };
  };

  try {
    const res = await login("alice@example.com", "Password123");
    assert.equal(res.success, true);
    assert.equal(res.user.name, "Alice");
    assert.equal(capturedOptions.credentials, "include");
    assert.equal(capturedOptions.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: login handles 400 Bad Request validation error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({
      message: "Email and password are required.",
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await login("", "");
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.equal(err.message, "Email and password are required.");
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: login handles 401 Unauthorized for invalid credentials", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      message: "Invalid email or password.",
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await login("user@example.com", "WrongPassword");
      },
      (err) => {
        assert.equal(err.status, 401);
        assert.equal(err.message, "Invalid email or password.");
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: getMe checks session with credentials include", async () => {
  const originalFetch = globalThis.fetch;
  let capturedOptions = null;

  globalThis.fetch = async (url, options) => {
    capturedOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        user: { id: "123", name: "Alice", email: "alice@example.com" },
      }),
    };
  };

  try {
    const res = await getMe();
    assert.equal(res.success, true);
    assert.equal(capturedOptions.credentials, "include");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authService: logout calls POST /logout with credentials include", async () => {
  const originalFetch = globalThis.fetch;
  let capturedOptions = null;

  globalThis.fetch = async (url, options) => {
    capturedOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Logged out successfully",
      }),
    };
  };

  try {
    const res = await logout();
    assert.equal(res.success, true);
    assert.equal(capturedOptions.credentials, "include");
    assert.equal(capturedOptions.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
