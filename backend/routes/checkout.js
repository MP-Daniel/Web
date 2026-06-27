const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { createWhatsappCheckout } = require("../controllers/checkoutController.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const checkoutRouter = Router();

const checkoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      message: "Demasiados intentos de checkout. Intenta nuevamente en 15 minutos.",
    },
  },
});

/**
 * @openapi
 * /checkout/whatsapp:
 *   post:
 *     summary: Valida stock y genera un link de checkout por WhatsApp
 *     tags:
 *       - Checkout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/WhatsappCheckoutRequest"
 *     responses:
 *       201:
 *         description: Link de WhatsApp generado
 *       409:
 *         description: Stock insuficiente
 *       429:
 *         description: Demasiados intentos de checkout
 */
checkoutRouter.post("/", checkoutRateLimit, asyncHandler(createWhatsappCheckout));
checkoutRouter.post("/whatsapp", checkoutRateLimit, asyncHandler(createWhatsappCheckout));

module.exports = {
  checkoutRouter,
};
