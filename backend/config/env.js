const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "WHATSAPP_PHONE_NUMBER"];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  whatsappPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
  whatsappMessagePrefix:
    process.env.WHATSAPP_DEFAULT_MESSAGE_PREFIX ??
    "Hola, quiero hacer este pedido en Lumina:",
  createPendingWhatsappOrders: process.env.CREATE_PENDING_WHATSAPP_ORDERS !== "false",
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
};

module.exports = {
  env,
  validateEnv,
  requiredEnvVars
};
