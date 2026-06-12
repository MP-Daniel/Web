const jwt = require("jsonwebtoken");
const { env } = require("../config/env.js");
const { httpError } = require("../utils/httpError.js");

function requireAdmin(req, res, next) {
  if (!env.jwtSecret) {
    return next(httpError(500, "JWT secret is not configured"));
  }

  const authHeader = req.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(httpError(401, "Debes iniciar sesión para acceder al panel admin."));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (payload.role !== "admin") {
      return next(httpError(403, "No tienes permisos de administrador."));
    }

    req.admin = {
      username: payload.username,
      role: payload.role,
    };

    return next();
  } catch {
    return next(httpError(401, "Tu sesión expiró o no es válida. Inicia sesión nuevamente."));
  }
}

module.exports = {
  requireAdmin,
};
