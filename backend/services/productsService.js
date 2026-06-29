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

async function listProducts(query) {
  const filters = productQuerySchema.parse(query);

  let dbQuery = supabaseAdmin.from("products").select(productSelect).eq("is_active", true);

  if (filters.search) {
    dbQuery = dbQuery.ilike("name", `%${filters.search}%`);
  }

  if (filters.category && filters.category !== "Todos") {
    dbQuery = dbQuery.eq("category", filters.category);
  }

  if (filters.minPrice !== undefined) {
    dbQuery = dbQuery.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    dbQuery = dbQuery.lte("price", filters.maxPrice);
  }

  if (filters.sort === "price-asc") {
    dbQuery = dbQuery.order("price", { ascending: true });
  } else if (filters.sort === "price-desc") {
    dbQuery = dbQuery.order("price", { ascending: false });
  } else {
    dbQuery = dbQuery.order("popularity", { ascending: false });
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw httpError(500, "Could not fetch products", error.message);
  }

  return data;
}

async function getProduct(idOrSlug) {
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

  return data;
}

module.exports = {
  getProduct,
  listProducts,
};