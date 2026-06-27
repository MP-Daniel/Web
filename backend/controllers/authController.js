const authService = require("../services/authService.js");

function createAdminToken(req, res) {
  const session = authService.createAdminToken(req.body);

  res.json(session);
}

function getAdminSession(req, res) {
  res.json(authService.getAdminSession(req.admin));
}

module.exports = {
  createAdminToken,
  getAdminSession,
};
