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

async function listProducts(req, res) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(productSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw httpError(500, "Could not fetch admin products", error.message);
  }

  res.json({ products: data });
}

async function createProduct(req, res) {
  const payload = productSchema.parse(req.body);
  const slug = slugify(payload.name);

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      slug,
      name: payload.name,
      category: payload.category,
      price: payload.price,
      short_description: payload.shortDescription,
      long_description: payload.longDescription,
      accent: payload.accent,
      tag: payload.tag,
      popularity: payload.popularity,
      variant: payload.variant,
      benefits: payload.benefits,
      ingredients: payload.ingredients,
      visual_style: payload.visualStyle,
      visual_label: payload.visualLabel || payload.name,
      visual_note: payload.visualNote || payload.variant,
      image_url: payload.imageUrl || null,
      is_active: true,
    })
    .select("id, slug, name")
    .single();

  if (productError) {
    throw httpError(500, "Could not create product", productError.message);
  }

  await upsertVariants(product.id, slug, payload);

  res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const productId = Number(req.params.id);
  const payload = productSchema.parse(req.body);
  const slug = slugify(payload.name);

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .update({
      slug,
      name: payload.name,
      category: payload.category,
      price: payload.price,
      short_description: payload.shortDescription,
      long_description: payload.longDescription,
      accent: payload.accent,
      tag: payload.tag,
      popularity: payload.popularity,
      variant: payload.variant,
      benefits: payload.benefits,
      ingredients: payload.ingredients,
      visual_style: payload.visualStyle,
      visual_label: payload.visualLabel || payload.name,
      visual_note: payload.visualNote || payload.variant,
      image_url: payload.imageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id, slug, name")
    .single();

  if (productError) {
    throw httpError(500, "Could not update product", productError.message);
  }

  await upsertVariants(productId, slug, payload);

  res.json({ product });
}

async function deactivateProduct(req, res) {
  const productId = Number(req.params.id);

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

  res.json({ ok: true });
}

async function updateStock(req, res) {
  const payload = stockSchema.parse(req.body);

  for (const variant of payload.variants) {
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

  res.json({ ok: true });
}

async function listOrders(req, res) {
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

  res.json({ orders: data });
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
  updateStock,
};
