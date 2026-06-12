const { Router } = require("express");
const { createAdminToken, getAdminSession } = require("../controllers/authController.js");
const { requireAdmin } = require("../middleware/requireAdmin.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const authRouter = Router();

authRouter.post("/login", asyncHandler(createAdminToken));
authRouter.get("/me", requireAdmin, asyncHandler(getAdminSession));

module.exports = {
  authRouter,
};
