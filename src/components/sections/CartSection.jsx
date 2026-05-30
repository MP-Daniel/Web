import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice, parsePrice } from "../../utils/price";

function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  const itemTotal = formatPrice(parsePrice(item.price) * item.quantity);

  return (
    <article className="cart-item">
      <div className="cart-item-copy">
        <p className="eyebrow">{item.category}</p>
        <h3>{item.name}</h3>
        <p>{item.price} por unidad</p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-stepper" aria-label={`Cantidad de ${item.name}`}>
          <button type="button" onClick={() => onDecrease(item.id)}>
            -
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onIncrease(item.id)}>
            +
          </button>
        </div>
        <strong>{itemTotal}</strong>
        <button className="remove-button" type="button" onClick={() => onRemove(item.id)}>
          Eliminar
        </button>
      </div>
    </article>
  );
}

export function CartSection({
  eyebrow = "Carrito de compras",
  title = "Tu selección de maquillaje en una vista clara y editable.",
  description = "Ajusta cantidades, elimina productos y revisa el resumen antes de continuar con el siguiente paso del ecommerce.",
}) {
  const {
    items,
    itemCount,
    subtotalLabel,
    totalLabel,
    increaseItem,
    decreaseItem,
    removeItem,
  } = useCart();

  return (
    <section className="cart-section" id="carrito">
      <div className="cart-panel">
        <div className="cart-heading">
          <div>
            <p className="section-tag">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <p>{description}</p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="eyebrow">Sin productos</p>
            <h3>Tu carrito está vacío.</h3>
            <p>Agrega productos desde el catálogo para empezar a construir tu pedido.</p>
            <Link className="primary-button empty-action" to="/catalog">
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onDecrease={decreaseItem}
                onIncrease={increaseItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="cart-summary-card">
        <p className="section-tag">Resumen</p>
        <h2>{itemCount} productos en carrito</h2>

        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{subtotalLabel}</strong>
        </div>
        <div className="summary-row">
          <span>Envío</span>
          <strong>Gratis</strong>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <strong>{totalLabel}</strong>
        </div>

        <button type="button" className="primary-button summary-button">
          Continuar compra
        </button>
      </aside>
    </section>
  );
}
