const checkoutService = require("../services/checkoutService.js");

async function createWhatsappCheckout(req, res) {
  const checkout = await checkoutService.createWhatsappCheckout(req.body);

  res.status(201).json(checkout);
}

module.exports = {
  createWhatsappCheckout,
};
