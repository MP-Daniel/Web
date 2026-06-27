const { Router } = require("express");
const { getProduct, listProducts } = require("../controllers/productsController.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const productsRouter = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Lista productos activos
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: Labios
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popularity, price-asc, price-desc]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
productsRouter.get("/", asyncHandler(listProducts));

/**
 * @openapi
 * /products/{idOrSlug}:
 *   get:
 *     summary: Obtiene detalle de un producto por id o slug
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
productsRouter.get("/:idOrSlug", asyncHandler(getProduct));

module.exports = {
  productsRouter,
};
