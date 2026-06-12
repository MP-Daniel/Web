const { Router } = require("express");

const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica si la API esta corriendo
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API disponible
 */
healthRouter.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "lumina-api",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  healthRouter,
};
