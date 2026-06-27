const productsService = require("../services/productsService.js");

async function listProducts(req, res) {
  const products = await productsService.listProducts(req.query);

  res.json({ products });
}

async function getProduct(req, res) {
  const { idOrSlug } = req.params;
  const product = await productsService.getProduct(idOrSlug);

  res.json({ product });
}

module.exports = {
  getProduct,
  listProducts,
};
