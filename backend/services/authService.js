const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { env } = require("../config/env.js");
const { httpError } = require("../utils/httpError.js");

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

function createAdminToken(payload) {
  if (!env.adminUsername || !env.adminPassword || !env.jwtSecret) {
    throw httpError(500, "La autenticación admin no está configurada.");
  }

  const parsedPayload = loginSchema.parse(payload);

  if (parsedPayload.username !== env.adminUsername || parsedPayload.password !== env.adminPassword) {
    throw httpError(401, "Usuario o contraseña incorrectos.");
  }

  const token = jwt.sign(
    {
      role: "admin",
      username: env.adminUsername,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

  return {
    token,
    user: {
      username: env.adminUsername,
      role: "admin",
    },
  };
}

function getAdminSession(admin) {
  return {
    user: {
      username: admin.username,
      role: admin.role,
    },
  };
}

module.exports = {
  createAdminToken,
  getAdminSession,
};