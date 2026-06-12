const { env } = require("../config/env.js");
const { formatCurrency } = require("./price.js");

function sanitizePhoneNumber(phoneNumber) {
  return phoneNumber.replace(/\D/g, "");
}

function buildWhatsappCheckoutUrl({ items, orderId, totalAmount }) {
  const lines = [
    env.whatsappMessagePrefix,
    "",
    ...items.map(
      (item) =>
        `- ${item.name}${item.variantName ? ` (${item.variantName})` : ""} x${item.quantity}: ${formatCurrency(item.lineTotal)}`,
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
};
