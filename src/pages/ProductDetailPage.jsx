import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ui/ProductCard";
import { useCart } from "../context/CartContext";
import { getProduct, getProducts } from "../services/api";

export function ProductDetailPage() {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setIsLoading(true);
      setError("");
      setNotFound(false);

      try {
        const apiProduct = await getProduct(productId);

        if (controller.signal.aborted) {
          return;
        }

        setProduct(apiProduct);

        const related = await getProducts({
          category: apiProduct.category,
          sort: "popularity",
        });

        if (!controller.signal.aborted) {
          setRelatedProducts(related.filter((item) => item.id !== apiProduct.id).slice(0, 3));
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          const message = loadError.message || "No se pudo cargar el producto.";
          setError(message);
          setNotFound(message.toLowerCase().includes("not found"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [productId]);

  if (isLoading) {
    return (
      <main className="page-shell page-main">
        <div className="empty-state">
          <p className="eyebrow">Cargando</p>
          <h3>Consultando el producto.</h3>
          <p>Estamos trayendo la información actualizada desde Supabase.</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="page-shell page-main">
        <div className="empty-state">
          <p className="eyebrow">{notFound ? "Producto no encontrado" : "Error de conexión"}</p>
          <h3>
            {notFound
              ? "La referencia que buscas no está disponible."
              : "No pudimos cargar este producto."}
          </h3>
          <p>{notFound ? "Regresa al catálogo para seguir explorando." : error}</p>
          <Link className="primary-button" to="/catalog">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell page-main">
      <section className={`detail-page ${product.accent}`}>
        <div className="detail-visual-panel">
          <div className={`detail-swatch ${product.visual?.style ?? "bottle"}`}>
            <div className="product-glow" />
            <div className="product-render large">
              <span className="product-render-cap" />
              <span className="product-render-body" />
            </div>
            <div className="detail-swatch-copy">
              <strong>{product.visual?.label}</strong>
              <span>{product.variant}</span>
            </div>
          </div>
          <div className="detail-badge">{product.tag}</div>
        </div>

        <div className="detail-copy">
          <p className="section-tag">{product.category}</p>
          <h2>{product.name}</h2>
          <strong className="detail-price">{product.price}</strong>
          <p className="detail-description">{product.longDescription}</p>
          <p className="detail-variant">{product.variant}</p>

          <div className="detail-columns">
            <div>
              <h3>Beneficios</h3>
              <ul className="detail-list">
                {product.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Ingredientes destacados</h3>
              <ul className="detail-list">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="shade-group">
            <h3>Tonos disponibles</h3>
            <div className="category-pills">
              {product.shades.map((shade) => (
                <span className="category-pill subtle" key={shade}>
                  {shade}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-cta-row">
            <button
              type="button"
              className="primary-button detail-add-button"
              onClick={() =>
                addItem({
                  id: product.id,
                  variantId: product.variants[0]?.id,
                  name: product.name,
                  price: product.price,
                  category: product.category,
                })
              }
            >
              Agregar al carrito
            </button>
            <Link className="secondary-button" to="/cart">
              Ir al carrito
            </Link>
            <Link className="secondary-button" to="/catalog">
              Seguir comprando
            </Link>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="related-section">
          <div className="section-heading stack">
            <div>
              <p className="section-tag">Relacionados</p>
              <h2>Más opciones dentro de {product.category.toLowerCase()}.</h2>
            </div>
            <p>Completa tu selección con productos afines en fórmula, intención y estética.</p>
          </div>

          <div className="products-grid">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
