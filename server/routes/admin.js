const { Router } = require("express");
const {
  createProduct,
  deactivateProduct,
  listOrders,
  listProducts,
  updateProduct,
  updateStock,
} = require("../controllers/adminController.js");
const { requireAdmin } = require("../middleware/requireAdmin.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/products", asyncHandler(listProducts));

/**
 * @openapi
 * /admin/products:
 *   post:
 *     summary: Crea un producto con variantes e inventario inicial
 *     tags:
 *       - Admin
 *     security:
 *       - AdminBearerAuth: []
 */
adminRouter.post("/products", asyncHandler(createProduct));

adminRouter.put("/products/:id", asyncHandler(updateProduct));
adminRouter.delete("/products/:id", asyncHandler(deactivateProduct));
adminRouter.patch("/products/:id/stock", asyncHandler(updateStock));
adminRouter.get("/orders", asyncHandler(listOrders));

module.exports = {
  adminRouter,
};
