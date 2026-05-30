export function ContactPage() {
  return (
    <main className="page-shell page-main">
      <section className="contact-page">
        <div className="section-heading stack">
          <div>
            <p className="section-tag">Contacto</p>
            <h2>Conecta con el equipo de Lumina para asesoría, prensa o colaboración.</h2>
          </div>
          <p>
            Escríbenos si necesitas ayuda con tonos, compras mayoristas o activaciones de marca.
          </p>
        </div>

        <div className="contact-grid">
          <article className="content-card">
            <p className="eyebrow">Canales</p>
            <h3>Hablemos contigo</h3>
            <p>hola@luminabeauty.co</p>
            <p>+57 300 555 0101</p>
            <p>Bogotá, Colombia</p>
          </article>

          <form className="contact-form">
            <div className="form-row">
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" placeholder="Tu nombre" />
            </div>
            <div className="form-row">
              <label htmlFor="email">Correo</label>
              <input id="email" type="email" placeholder="tu@correo.com" />
            </div>
            <div className="form-row">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" rows="5" placeholder="Cuéntanos en qué te podemos ayudar" />
            </div>
            <button className="primary-button form-button" type="submit">
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
