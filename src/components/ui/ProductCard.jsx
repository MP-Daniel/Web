import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const productClassByAccent = {
  rose: "product-card rose",
  sand: "product-card sand",
  gold: "product-card gold",
  espresso: "product-card espresso",
};

function ProductVisual({ product }) {
  const visual = product.visual ?? { style: "bottle", label: product.category, note: product.variant };

  return (
    <div className={`product-swatch ${visual.style}`}>
      <div className="product-glow" />
      <div className="product-render">
        <span className="product-render-cap" />
        <span className="product-render-body" />
      </div>
      <div className="product-swatch-copy">
        <strong>{visual.label}</strong>
        <span>{visual.note}</span>
      </div>
    </div>
  );
}

export function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <article className={productClassByAccent[product.accent] ?? "product-card"}>
      <div className="product-top">
        <span>{product.category}</span>
        <strong>{product.price}</strong>
      </div>
      <ProductVisual product={product} />
      <div className="product-meta">
        <span className="product-tag">{product.tag}</span>
        <span className="product-popularity">{product.popularity}% love it</span>
      </div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="product-variant">{product.variant}</p>
      <div className="product-actions">
        <Link className="secondary-button product-link" to={`/product/${product.id}`}>
          Ver detalle
        </Link>
        <button
          type="button"
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
            })
          }
        >
          Agregar
        </button>
      </div>
    </article>
  );
}
