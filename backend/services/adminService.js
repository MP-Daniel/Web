const { z } = require("zod");
const { supabaseAdmin } = require("../config/supabase.js");
const { httpError } = require("../utils/httpError.js");

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80),
  price: z.number().int().nonnegative(),
  shortDescription: z.string().trim().min(8).max(300),
  longDescription: z.string().trim().min(20).max(1600),
  accent: z.enum(["rose", "sand", "gold", "espresso"]).default("rose"),
  tag: z.string().trim().min(2).max(60).default("Nuevo"),
  popularity: z.number().int().min(0).max(100).default(80),
  variant: z.string().trim().max(100).optional().default("Edicion principal"),
  benefits: z.array(z.string().trim().min(2).max(80)).min(1).max(8),
  ingredients: z.array(z.string().trim().min(2).max(80)).min(1).max(8),
  visualStyle: z.string().trim().max(60).optional().default("bottle"),
  visualLabel: z.string().trim().max(80).optional(),
  visualNote: z.string().trim().max(80).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  variants: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        name: z.string().trim().min(1).max(100),
        shade: z.string().trim().max(100).optional(),
        sku: z.string().trim().max(120).optional(),
        price: z.number().int().nonnegative().optional(),
        stock: z.number().int().nonnegative().default(0),
      }),
    )
    .min(1)
    .max(20),
});

const stockSchema = z.object({
  variants: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        stock: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

const orderStatusSchema = z.object({
  status: z.enum(["pending_whatsapp", "confirmed", "paid", "delivered", "cancelled"]),
});

const stockAffectingStatuses = new Set(["confirmed", "paid", "delivered"]);

const productSelect = `
  id,
  slug,
  name,
  category,
  price,
  short_description,
  long_description,
  accent,
  tag,
  popularity,
  variant,
  benefits,
  ingredients,
  visual_style,
  visual_label,
  visual_note,
  image_url,
  is_active,
  product_variants (
    id,
    name,
    shade,
    sku,
    price,
    image_url,
    inventory (
      stock,
      reserved_stock
    )
  )
`;

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function listProducts() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(productSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw httpError(500, "Could not fetch admin products", error.message);
  }

  return data;
}

async function createProduct(payload) {
  const parsedPayload = productSchema.parse(payload);
  const slug = slugify(parsedPayload.name);

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      slug,
      name: parsedPayload.name,
      category: parsedPayload.category,
      price: parsedPayload.price,
      short_description: parsedPayload.shortDescription,
      long_description: parsedPayload.longDescription,
      accent: parsedPayload.accent,
      tag: parsedPayload.tag,
      popularity: parsedPayload.popularity,
      variant: parsedPayload.variant,
      benefits: parsedPayload.benefits,
      ingredients: parsedPayload.ingredients,
      visual_style: parsedPayload.visualStyle,
      visual_label: parsedPayload.visualLabel || parsedPayload.name,
      visual_note: parsedPayload.visualNote || parsedPayload.variant,
      image_url: parsedPayload.imageUrl || null,
      is_active: true,
    })
    .select("id, slug, name")
    .single();

  if (productError) {
    throw httpError(500, "Could not create product", productError.message);
  }

  await upsertVariants(product.id, slug, parsedPayload);

  return product;
}

async function updateProduct(productId, payload) {
  const parsedPayload = productSchema.parse(payload);
  const slug = slugify(parsedPayload.name);

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .update({
      slug,
      name: parsedPayload.name,
      category: parsedPayload.category,
      price: parsedPayload.price,
      short_description: parsedPayload.shortDescription,
      long_description: parsedPayload.longDescription,
      accent: parsedPayload.accent,
      tag: parsedPayload.tag,
      popularity: parsedPayload.popularity,
      variant: parsedPayload.variant,
      benefits: parsedPayload.benefits,
      ingredients: parsedPayload.ingredients,
      visual_style: parsedPayload.visualStyle,
      visual_label: parsedPayload.visualLabel || parsedPayload.name,
      visual_note: parsedPayload.visualNote || parsedPayload.variant,
      image_url: parsedPayload.imageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id, slug, name")
    .single();

  if (productError) {
    throw httpError(500, "Could not update product", productError.message);
  }

  await upsertVariants(productId, slug, parsedPayload);

  return product;
}

async function deactivateProduct(productId) {
  const { error } = await supabaseAdmin
    .from("products")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    throw httpError(500, "Could not deactivate product", error.message);
  }

  return { ok: true };
}

async function updateStock(payload) {
  const parsedPayload = stockSchema.parse(payload);

  for (const variant of parsedPayload.variants) {
    const { error } = await supabaseAdmin
      .from("inventory")
      .update({
        stock: variant.stock,
        updated_at: new Date().toISOString(),
      })
      .eq("variant_id", variant.variantId);

    if (error) {
      throw httpError(500, "Could not update stock", error.message);
    }
  }

  return { ok: true };
}

async function listOrders() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id,
      status,
      channel,
      customer_name,
      customer_phone,
      total_amount,
      created_at,
      order_items (
        id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        line_total,
        products (
          id,
          name
        ),
        product_variants (
          id,
          name
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw httpError(500, "Could not fetch orders", error.message);
  }

  return data;
}

async function updateOrderStatus(orderId, payload) {
  const parsedPayload = orderStatusSchema.parse(payload);

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id,
      status,
      order_items (
        id,
        product_id,
        variant_id,
        quantity
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    throw httpError(404, "Pedido no encontrado", error?.message);
  }

  const previousAffectsStock = stockAffectingStatuses.has(order.status);
  const nextAffectsStock = stockAffectingStatuses.has(parsedPayload.status);

  if (!previousAffectsStock && nextAffectsStock) {
    await adjustOrderInventory(order.order_items, -1);
  }

  if (previousAffectsStock && !nextAffectsStock) {
    await adjustOrderInventory(order.order_items, 1);
  }

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: parsedPayload.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("id, status, total_amount, created_at")
    .single();

  if (updateError) {
    if (!previousAffectsStock && nextAffectsStock) {
      await adjustOrderInventory(order.order_items, 1);
    }

    if (previousAffectsStock && !nextAffectsStock) {
      await adjustOrderInventory(order.order_items, -1);
    }

    throw httpError(500, "No se pudo actualizar el estado del pedido", updateError.message);
  }

  return updatedOrder;
}

async function adjustOrderInventory(orderItems, direction) {
  for (const item of orderItems) {
    if (!item.variant_id) {
      throw httpError(400, "El pedido tiene un item sin variante asociada.");
    }

    const { data: inventory, error: inventoryError } = await supabaseAdmin
      .from("inventory")
      .select("variant_id, stock, reserved_stock")
      .eq("variant_id", item.variant_id)
      .single();

    if (inventoryError || !inventory) {
      throw httpError(404, "No se encontro inventario para una variante del pedido.", inventoryError?.message);
    }

    const nextStock = inventory.stock + item.quantity * direction;

    if (nextStock < 0) {
      throw httpError(409, "No hay stock suficiente para confirmar este pedido.", {
        variantId: item.variant_id,
        requested: item.quantity,
        available: inventory.stock,
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("inventory")
      .update({
        stock: nextStock,
        updated_at: new Date().toISOString(),
      })
      .eq("variant_id", item.variant_id);

    if (updateError) {
      throw httpError(500, "No se pudo actualizar el inventario del pedido.", updateError.message);
    }
  }
}

async function upsertVariants(productId, slug, payload) {
  for (const variant of payload.variants) {
    const sku = variant.sku || `${slug}-${slugify(variant.name)}`;

    const query = variant.id
      ? supabaseAdmin
          .from("product_variants")
          .update({
            name: variant.name,
            shade: variant.shade || variant.name,
            sku,
            price: variant.price ?? payload.price,
          })
          .eq("id", variant.id)
      : supabaseAdmin.from("product_variants").insert({
          product_id: productId,
          name: variant.name,
          shade: variant.shade || variant.name,
          sku,
          price: variant.price ?? payload.price,
        });

    const { data: savedVariant, error: variantError } = await query.select("id").single();

    if (variantError) {
      throw httpError(500, "Could not save product variant", variantError.message);
    }

    const { error: inventoryError } = await supabaseAdmin.from("inventory").upsert(
      {
        variant_id: savedVariant.id,
        stock: variant.stock,
        reserved_stock: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "variant_id" },
    );

    if (inventoryError) {
      throw httpError(500, "Could not save inventory", inventoryError.message);
    }
  }
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
