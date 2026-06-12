import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useCart } from "../../context/CartContext";
import { primaryNavigation, siteBrand } from "../../data/siteContent";

export function TopBar() {
  const { itemCount } = useCart();
  const { isAuthenticated, logout } = useAdminAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="page-shell topbar">
        <div className="topbar-left">
          <button
            className="menu-button"
            type="button"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          >
            <span />
            <span />
            <span />
          </button>

          {isMenuOpen ? (
            <div className="dropdown-menu">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </NavLink>
              <NavLink to="/catalog" onClick={() => setIsMenuOpen(false)}>
                Catálogo
              </NavLink>
              <NavLink
                to={isAuthenticated ? "/admin" : "/login"}
                onClick={() => setIsMenuOpen(false)}
              >
                Mi Cuenta
              </NavLink>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </button>
              ) : null}
            </div>
          ) : null}

          <NavLink className="brand-lockup" to="/">
            <span className="brand-mark">{siteBrand.monogram}</span>
            <div>
              <p className="eyebrow">{siteBrand.eyebrow}</p>
              <h1>{siteBrand.name}</h1>
            </div>
          </NavLink>
        </div>

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
