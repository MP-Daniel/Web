const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function formatPriceLabel(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeProduct(product) {
  const variants = product.product_variants ?? [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: typeof product.price === "number" ? formatPriceLabel(product.price) : product.price,
    priceAmount: product.price,
    description: product.short_description ?? product.description ?? "",
    longDescription: product.long_description ?? product.longDescription ?? "",
    accent: product.accent ?? "rose",
    tag: product.tag ?? "Nuevo",
    popularity: product.popularity ?? 0,
    variant: product.variant ?? "Edicion principal",
    benefits: product.benefits ?? [],
    ingredients: product.ingredients ?? [],
    shades: variants.map((variant) => variant.shade || variant.name).filter(Boolean),
    visual: {
      style: product.visual_style ?? "bottle",
      label: product.visual_label ?? product.name,
      note: product.visual_note ?? product.variant ?? "Producto",
    },
    variants: variants.map((variant) => {
      const inventory = Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory;
      const stock = inventory?.stock ?? 0;
      const reservedStock = inventory?.reserved_stock ?? 0;

      return {
        id: variant.id,
        name: variant.name,
        shade: variant.shade,
        sku: variant.sku,
        price: variant.price,
        stock,
        reservedStock,
        availableStock: Math.max(stock - reservedStock, 0),
      };
    }),
  };
}

async function request(path, options = {}) {
  const { headers, ...fetchOptions } = options;

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend este corriendo.");
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = payload.error?.errors;
    const readableErrors = Array.isArray(validationErrors)
      ? validationErrors.map((error) => `${error.path}: ${error.message}`).join(" | ")
      : "";
    const message = readableErrors || payload.error?.details || payload.error?.message;

    throw new Error(message ?? "No se pudo completar la solicitud");
  }

  return payload;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function loginAdmin(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getAdminSession(token) {
  return request("/auth/me", {
    headers: authHeaders(token),
  });
}

export async function getProducts(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "Todos") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  const payload = await request(`/products${query ? `?${query}` : ""}`);

  return (payload.products ?? []).map(normalizeProduct);
}

export async function getProduct(idOrSlug) {
  const payload = await request(`/products/${idOrSlug}`);
  return normalizeProduct(payload.product);
}

export function createWhatsappCheckout({ items, customer }) {
  return request("/checkout", {
    method: "POST",
    body: JSON.stringify({
      customer,
      items: items.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    }),
  });
}

export function getAdminProducts(token) {
  return request("/admin/products", {
    headers: authHeaders(token),
  });
}

export function createAdminProduct({ token, product }) {
  return request("/admin/products", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });
}

export function updateAdminProduct({ token, productId, product }) {
  return request(`/admin/products/${productId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });
}

export function deactivateAdminProduct({ token, productId }) {
  return request(`/admin/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function updateAdminStock({ token, productId, variants }) {
  return request(`/admin/products/${productId}/stock`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ variants }),
  });
}

export function getAdminOrders(token) {
  return request("/admin/orders", {
    headers: authHeaders(token),
  });
}
