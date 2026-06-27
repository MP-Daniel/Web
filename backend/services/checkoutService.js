const { z } = require("zod");
const { env } = require("../config/env.js");
const { supabaseAdmin } = require("../config/supabase.js");
const { buildWhatsappCheckoutUrl } = require("../utils/whatsapp.js");
const { httpError } = require("../utils/httpError.js");

const checkoutSchema = z.object({
  customer: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      phone: z.string().trim().max(40).optional(),
      notes: z.string().trim().max(500).optional(),
    })
    .optional()
    .default({}),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive().optional(),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(30),
});

function getInventoryRecord(variant) {
  if (Array.isArray(variant.inventory)) {
    return variant.inventory[0];
  }

  return variant.inventory;
}

function getAvailableStock(variant) {
  const inventory = getInventoryRecord(variant);

  return Math.max((inventory?.stock ?? 0) - (inventory?.reserved_stock ?? 0), 0);
}

function findCheckoutVariant(product, item) {
  const variants = product.product_variants ?? [];

  if (item.variantId) {
    return variants.find((currentVariant) => currentVariant.id === item.variantId);
  }

  return variants.find((currentVariant) => getAvailableStock(currentVariant) >= item.quantity) ?? variants[0];
}

async function createWhatsappCheckout(payload) {
  const parsedPayload = checkoutSchema.parse(payload);
  const productIds = [...new Set(parsedPayload.items.map((item) => item.productId))];

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      id,
      name,
      price,
      is_active,
      product_variants (
        id,
        name,
        price,
        inventory (
          stock,
          reserved_stock
        )
      )
    `,
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (error) {
    throw httpError(500, "Could not validate checkout products", error.message);
  }

  const checkoutItems = parsedPayload.items.map((item) => {
    const product = products.find((currentProduct) => currentProduct.id === item.productId);

    if (!product) {
      throw httpError(400, `El producto ${item.productId} no esta disponible.`);
    }

    const variant = findCheckoutVariant(product, item);

    if (!variant) {
      throw httpError(400, `La variante seleccionada no esta disponible para ${product.name}.`);
    }

    const availableStock = getAvailableStock(variant);

    if (availableStock < item.quantity) {
      throw httpError(409, `${product.name} no tiene stock suficiente.`, {
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantName: variant.name,
        requested: item.quantity,
        available: availableStock,
      });
    }

    const unitPrice = variant.price ?? product.price;

    return {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantName: variant.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const totalAmount = checkoutItems.reduce((total, item) => total + item.lineTotal, 0);
  let orderId = null;

  if (env.createPendingWhatsappOrders) {
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        status: "pending_whatsapp",
        customer_name: parsedPayload.customer.name,
        customer_phone: parsedPayload.customer.phone,
        customer_notes: parsedPayload.customer.notes,
        total_amount: totalAmount,
        channel: "whatsapp",
      })
      .select("id")
      .single();

    if (orderError) {
      throw httpError(500, "Could not create pending order", orderError.message);
    }

    orderId = order.id;

    const { error: orderItemsError } = await supabaseAdmin.from("order_items").insert(
      checkoutItems.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
      })),
    );

    if (orderItemsError) {
      throw httpError(500, "Could not create order items", orderItemsError.message);
    }
  }

  const whatsappUrl = buildWhatsappCheckoutUrl({
    items: checkoutItems,
    orderId,
    totalAmount,
  });

  return {
    orderId,
    totalAmount,
    items: checkoutItems,
    whatsappUrl,
  };
}

module.exports = {
  createWhatsappCheckout,
};
