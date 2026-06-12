const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { env } = require("../config/env.js");
const { httpError } = require("../utils/httpError.js");

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

function createAdminToken(req, res) {
  if (!env.adminUsername || !env.adminPassword || !env.jwtSecret) {
    throw httpError(500, "La autenticación admin no está configurada.");
  }

  const payload = loginSchema.parse(req.body);

  if (payload.username !== env.adminUsername || payload.password !== env.adminPassword) {
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

  res.json({
    token,
    user: {
      username: env.adminUsername,
      role: "admin",
    },
  });
}

function getAdminSession(req, res) {
  res.json({
    user: {
      username: req.admin.username,
      role: req.admin.role,
    },
  });
}

module.exports = {
  createAdminToken,
  getAdminSession,
};
