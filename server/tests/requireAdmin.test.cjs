const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const { loadFresh } = require("./testUtils.cjs");

const jwtEnv = {
  JWT_SECRET: "guard-secret-that-is-long-enough",
};

function createRequest(token) {
  return {
    admin: undefined,
    get(headerName) {
      if (headerName === "authorization" && token) {
        return `Bearer ${token}`;
      }

      return undefined;
    },
  };
}

test("requireAdmin accepts a valid admin JWT", () => {
  const { moduleExports, restoreEnv } = loadFresh("middleware/requireAdmin.js", jwtEnv);
  const token = jwt.sign({ username: "admin-test", role: "admin" }, jwtEnv.JWT_SECRET);
  const req = createRequest(token);
  let nextError = null;
  let nextCalled = false;

  try {
    moduleExports.requireAdmin(req, {}, (error) => {
      nextCalled = true;
      nextError = error;
    });

    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
    assert.deepEqual(req.admin, {
      username: "admin-test",
      role: "admin",
    });
  } finally {
    restoreEnv();
  }
});

test("requireAdmin rejects missing token", () => {
  const { moduleExports, restoreEnv } = loadFresh("middleware/requireAdmin.js", jwtEnv);
  let nextError = null;

  try {
    moduleExports.requireAdmin(createRequest(), {}, (error) => {
      nextError = error;
    });

    assert.equal(nextError.statusCode, 401);
    assert.equal(nextError.message, "Debes iniciar sesión para acceder al panel admin.");
  } finally {
    restoreEnv();
  }
});

test("requireAdmin rejects non-admin JWT", () => {
  const { moduleExports, restoreEnv } = loadFresh("middleware/requireAdmin.js", jwtEnv);
  const token = jwt.sign({ username: "user-test", role: "customer" }, jwtEnv.JWT_SECRET);
  let nextError = null;

  try {
    moduleExports.requireAdmin(createRequest(token), {}, (error) => {
      nextError = error;
    });

    assert.equal(nextError.statusCode, 403);
    assert.equal(nextError.message, "No tienes permisos de administrador.");
  } finally {
    restoreEnv();
  }
});
