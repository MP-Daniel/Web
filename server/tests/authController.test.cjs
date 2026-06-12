const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const { createMockResponse, loadFresh } = require("./testUtils.cjs");

const authEnv = {
  ADMIN_USERNAME: "admin-test",
  ADMIN_PASSWORD: "password-test",
  JWT_SECRET: "test-secret-that-is-long-enough",
  JWT_EXPIRES_IN: "2h",
};

test("createAdminToken returns a JWT for valid credentials", () => {
  const { moduleExports, restoreEnv } = loadFresh("controllers/authController.js", authEnv);
  const res = createMockResponse();

  try {
    moduleExports.createAdminToken(
      {
        body: {
          username: "admin-test",
          password: "password-test",
        },
      },
      res,
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.username, "admin-test");
    assert.equal(res.body.user.role, "admin");

    const decoded = jwt.verify(res.body.token, authEnv.JWT_SECRET);
    assert.equal(decoded.username, "admin-test");
    assert.equal(decoded.role, "admin");
  } finally {
    restoreEnv();
  }
});

test("createAdminToken rejects invalid credentials", () => {
  const { moduleExports, restoreEnv } = loadFresh("controllers/authController.js", authEnv);

  try {
    assert.throws(
      () =>
        moduleExports.createAdminToken(
          {
            body: {
              username: "admin-test",
              password: "wrong-password",
            },
          },
          createMockResponse(),
        ),
      {
        message: "Usuario o contraseña incorrectos.",
        statusCode: 401,
      },
    );
  } finally {
    restoreEnv();
  }
});
