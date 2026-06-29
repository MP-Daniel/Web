const { env } = require("../config/env.js");
const { formatCurrency } = require("./price.js");

function sanitizePhoneNumber(phoneNumber) {
  return phoneNumber.replace(/\D/g, "");
}

function toMessageText(value, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function buildWhatsappCheckoutUrl({ items, orderId, totalAmount }) {
  const lines = [
    env.whatsappMessagePrefix,
    "",
    ...items.map(
      (item) => {
        const productName = toMessageText(item.name, "Producto");
        const variantName = toMessageText(item.variantName);

        return `- ${productName}${variantName ? ` (${variantName})` : ""} x${item.quantity}: ${formatCurrency(item.lineTotal)}`;
      },
    ),
    "",
    `Total estimado: ${formatCurrency(totalAmount)}`,
  ];

  if (orderId) {
    lines.push(`Referencia del pedido: ${orderId}`);
  }

  const message = encodeURIComponent(lines.join("\n"));
  const phoneNumber = sanitizePhoneNumber(env.whatsappPhoneNumber);

  return `https://wa.me/${phoneNumber}?text=${message}`;
}

module.exports = {
  buildWhatsappCheckoutUrl,
  sanitizePhoneNumber,
};
