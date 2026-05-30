import { NavLink } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <p className="section-tag">Lumina Beauty Atelier</p>
          <h2>Cosmética contemporánea con una experiencia digital refinada.</h2>
        </div>
        <div className="footer-links">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/catalog">Catálogo</NavLink>
          <NavLink to="/about">Nosotros</NavLink>
          <NavLink to="/contact">Contacto</NavLink>
        </div>
      </div>
    </footer>
  );
}
