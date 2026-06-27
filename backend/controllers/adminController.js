const adminService = require("../services/adminService.js");

async function listProducts(req, res) {
  const products = await adminService.listProducts();

  res.json({ products });
}

async function createProduct(req, res) {
  const product = await adminService.createProduct(req.body);

  res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const productId = Number(req.params.id);
  const product = await adminService.updateProduct(productId, req.body);

  res.json({ product });
}

async function deactivateProduct(req, res) {
  const productId = Number(req.params.id);
  await adminService.deactivateProduct(productId);

  res.json({ ok: true });
}

async function updateStock(req, res) {
  await adminService.updateStock(req.body);

  res.json({ ok: true });
}

async function listOrders(req, res) {
  const orders = await adminService.listOrders();

  res.json({ orders });
}

async function updateOrderStatus(req, res) {
  const order = await adminService.updateOrderStatus(req.params.id, req.body);

  res.json({ order });
}

module.exports = {
  createProduct,
  deactivateProduct,
  listOrders,
  listProducts,
  updateProduct,
  updateOrderStatus,
  updateStock,
};
