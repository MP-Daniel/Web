const { supabaseAdmin } = require("../config/supabase.js");
const { validateEnv } = require("../config/env.js");

validateEnv();

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePrice(priceLabel) {
  return Number(priceLabel.replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ""));
}

async function importProducts() {
  const { products } = await import("../../src/data/products.js");

  for (const product of products) {
    const productPayload = {
      slug: slugify(product.name),
      name: product.name,
      category: product.category,
      price: parsePrice(product.price),
      short_description: product.description,
      long_description: product.longDescription,
      accent: product.accent,
      tag: product.tag,
      popularity: product.popularity,
      variant: product.variant,
      benefits: product.benefits,
      ingredients: product.ingredients,
      visual_style: product.visual?.style,
      visual_label: product.visual?.label,
      visual_note: product.visual?.note,
      is_active: true,
    };

    const { data: savedProduct, error: productError } = await supabaseAdmin
      .from("products")
      .upsert(productPayload, { onConflict: "slug" })
      .select("id")
      .single();

    if (productError) {
      throw productError;
    }

    for (const shade of product.shades) {
      const sku = `${slugify(product.name)}-${slugify(shade)}`;

      const { data: savedVariant, error: variantError } = await supabaseAdmin
        .from("product_variants")
        .upsert(
          {
            product_id: savedProduct.id,
            name: shade,
            shade,
            sku,
            price: parsePrice(product.price),
          },
          { onConflict: "sku" },
        )
        .select("id")
        .single();

      if (variantError) {
        throw variantError;
      }

      const { error: inventoryError } = await supabaseAdmin.from("inventory").upsert(
        {
          variant_id: savedVariant.id,
          stock: 10,
          reserved_stock: 0,
        },
        { onConflict: "variant_id" },
      );

      if (inventoryError) {
        throw inventoryError;
      }
    }
  }

  console.log(`Imported ${products.length} products into Supabase.`);
}

importProducts().catch((error) => {
  console.error("Could not import products:", error);
  process.exitCode = 1;
});
