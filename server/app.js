const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const { env, validateEnv } = require("./config/env.js");
const { swaggerSpec } = require("./config/swagger.js");
const { adminRouter } = require("./routes/admin.js");
const { authRouter } = require("./routes/auth.js");
const { checkoutRouter } = require("./routes/checkout.js");
const { healthRouter } = require("./routes/health.js");
const { productsRouter } = require("./routes/products.js");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler.js");

validateEnv();

const app = express();

const helmetOptions =
  env.nodeEnv === "production"
    ? {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", env.frontendOrigin],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: true,
        referrerPolicy: { policy: "no-referrer" },
      }
    : {
        contentSecurityPolicy: false,
      };

app.use(helmet(helmetOptions));
app.use(
  cors({
    origin: env.frontendOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = {
  app,
};
