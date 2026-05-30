export function NewsletterSection({ newsletter }) {
  return (
    <section className="newsletter">
      <div>
        <p className="section-tag">{newsletter.eyebrow}</p>
        <h2>{newsletter.title}</h2>
      </div>
      <form className="newsletter-form">
        <input
          type="email"
          placeholder={newsletter.placeholder}
          aria-label="Correo electrónico"
        />
        <button type="submit">{newsletter.ctaLabel}</button>
      </form>
    </section>
  );
}
