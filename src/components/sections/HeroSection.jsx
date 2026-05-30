import { Link } from "react-router-dom";

function HeroAction({ action }) {
  return (
    <Link className={`${action.variant}-button`} to={action.href}>
      {action.label}
    </Link>
  );
}

function HeroFeatureCard({ featureCard }) {
  return (
    <section className="hero-card">
      <div className="floating-note">{featureCard.badge}</div>
      <div className="hero-visual" aria-hidden="true">
        <div className="visual-orb orb-one" />
        <div className="visual-orb orb-two" />
        <div className="visual-product">
          <span className="visual-cap" />
          <span className="visual-body" />
        </div>
      </div>
      <div className="hero-card-copy">
        <p className="eyebrow">{featureCard.eyebrow}</p>
        <h3>{featureCard.title}</h3>
        <p>{featureCard.description}</p>
      </div>
    </section>
  );
}

export function HeroSection({ hero }) {
  return (
    <section className="hero">
      <div className="hero-grid">
        <section className="hero-copy">
          <p className="section-tag">{hero.tag}</p>
          <h2>{hero.title}</h2>
          <p className="hero-text">{hero.description}</p>
          <div className="hero-actions">
            {hero.actions.map((action) => (
              <HeroAction key={action.href} action={action} />
            ))}
          </div>
        </section>

        <HeroFeatureCard featureCard={hero.featureCard} />
      </div>
    </section>
  );
}
