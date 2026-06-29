export function parsePrice(priceLabel) {
  return Number(priceLabel.replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ""));
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
