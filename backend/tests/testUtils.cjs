const path = require("node:path");

const serverRoot = path.resolve(__dirname, "..");

function serverPath(relativePath) {
  return path.join(serverRoot, relativePath);
}

function clearServerModule(relativePath) {
  delete require.cache[require.resolve(serverPath(relativePath))];
}

function clearServerModules(relativePaths) {
  relativePaths.forEach(clearServerModule);
}

function loadFresh(relativePath, env = {}) {
  const previousEnv = {};

  Object.entries(env).forEach(([key, value]) => {
    previousEnv[key] = process.env[key];
    process.env[key] = value;
  });

  clearServerModules([
    "config/env.js",
    "utils/httpError.js",
    "controllers/authController.js",
    "middleware/requireAdmin.js",
    "middleware/errorHandler.js",
    relativePath,
  ]);

  const moduleExports = require(serverPath(relativePath));

  function restoreEnv() {
    Object.entries(previousEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }

  return {
    moduleExports,
    restoreEnv,
  };
}

function createMockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

module.exports = {
  createMockResponse,
  loadFresh,
};
