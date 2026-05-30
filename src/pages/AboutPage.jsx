export function AboutPage() {
  return (
    <main className="page-shell page-main">
      <section className="content-page">
        <div className="section-heading stack">
          <div>
            <p className="section-tag">Nosotros</p>
            <h2>Lumina nace para unir fórmula, imagen y experiencia digital.</h2>
          </div>
          <p>
            Pensamos la belleza como una mezcla entre técnica, sensibilidad editorial y confianza
            en el día a día. Cada producto busca resolver una rutina real con una estética pulida.
          </p>
        </div>

        <div className="content-grid">
          <article className="content-card">
            <p className="eyebrow">Dirección creativa</p>
            <h3>Diseño con intención de marca</h3>
            <p>
              Tipografía, color y jerarquía visual trabajan juntos para que la tienda se sienta
              aspiracional pero clara.
            </p>
          </article>
          <article className="content-card">
            <p className="eyebrow">Curaduría</p>
            <h3>Categorías pensadas para comprar fácil</h3>
            <p>
              Labios, rostro, ojos, cejas y skincare están organizados para acompañar decisiones
              reales de compra.
            </p>
          </article>
          <article className="content-card">
            <p className="eyebrow">Experiencia</p>
            <h3>Una tienda pequeña, pero completa</h3>
            <p>
              Navegación funcional, detalle de producto y carrito activo en una misma identidad
              visual.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
