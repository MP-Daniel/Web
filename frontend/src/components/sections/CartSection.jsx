import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { createWhatsappCheckout } from "../../services/api";
import { formatPrice, parsePrice } from "../../utils/price";

function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  const itemTotal = formatPrice(parsePrice(item.price) * item.quantity);
  const itemKey = item.variantId ?? item.id;

  return (
    <article className="cart-item">
      <div className="cart-item-copy">
        <p className="eyebrow">{item.category}</p>
        <h3>{item.name}</h3>
        {item.variantName ? <p>{item.variantName}</p> : null}
        <p>{item.price} por unidad</p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-stepper" aria-label={`Cantidad de ${item.name}`}>
          <button type="button" onClick={() => onDecrease(itemKey)}>
            -
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onIncrease(itemKey)}>
            +
          </button>
        </div>
        <strong>{itemTotal}</strong>
        <button className="remove-button" type="button" onClick={() => onRemove(itemKey)}>
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
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [checkoutError, setCheckoutError] = useState("");
  const {
    items,
    itemCount,
    subtotalLabel,
    totalLabel,
    increaseItem,
    decreaseItem,
    removeItem,
  } = useCart();

  async function handleWhatsappCheckout() {
    setCheckoutError("");
    setCheckoutStatus("loading");

    try {
      const checkout = await createWhatsappCheckout({
        items,
        customer: {},
      });

      if (!checkout?.whatsappUrl) {
        throw new Error("El servidor no devolvió una URL de WhatsApp válida.");
      }

      window.location.assign(checkout.whatsappUrl);
      setCheckoutStatus("idle");
    } catch (error) {
      setCheckoutError(error.message || "No se pudo abrir WhatsApp. Intenta nuevamente.");
      setCheckoutStatus("error");
    }
  }

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
                key={item.variantId ?? item.id}
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

        <button
          type="button"
          className="primary-button summary-button"
          disabled={items.length === 0 || checkoutStatus === "loading"}
          onClick={handleWhatsappCheckout}
        >
          {checkoutStatus === "loading" ? "Validando stock..." : "Pagar por WhatsApp"}
        </button>
        {checkoutError ? <p className="checkout-error">{checkoutError}</p> : null}
      </aside>
    </section>
  );
}
