const { z } = require("zod");
const { supabaseAdmin } = require("../config/supabase.js");
const { httpError } = require("../utils/httpError.js");

const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(["popularity", "price-asc", "price-desc"]).optional().default("popularity"),
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

async function listProducts(req, res) {
  const filters = productQuerySchema.parse(req.query);

  let query = supabaseAdmin.from("products").select(productSelect).eq("is_active", true);

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.category && filters.category !== "Todos") {
    query = query.eq("category", filters.category);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("popularity", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw httpError(500, "Could not fetch products", error.message);
  }

  res.json({ products: data });
}

async function getProduct(req, res) {
  const { idOrSlug } = req.params;
  const isNumericId = /^\d+$/.test(idOrSlug);

  let query = supabaseAdmin
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .limit(1);

  query = isNumericId ? query.eq("id", Number(idOrSlug)) : query.eq("slug", idOrSlug);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw httpError(500, "Could not fetch product", error.message);
  }

  if (!data) {
    throw httpError(404, "Product not found");
  }

  res.json({ product: data });
}

module.exports = {
  getProduct,
  listProducts,
};
