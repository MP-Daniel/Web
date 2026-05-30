import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { primaryNavigation, siteBrand } from "../../data/siteContent";

export function TopBar() {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="page-shell topbar">
        <NavLink className="brand-lockup" to="/">
          <span className="brand-mark">{siteBrand.monogram}</span>
          <div>
            <p className="eyebrow">{siteBrand.eyebrow}</p>
            <h1>{siteBrand.name}</h1>
          </div>
        </NavLink>

        <div className="topbar-links">
          <nav className="topbar-nav" aria-label="Navegación principal">
            {primaryNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <NavLink className="cart-indicator" to="/cart" aria-label={`Carrito con ${itemCount} productos`}>
            <span>Carrito</span>
            <strong>{itemCount}</strong>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
