import { CollectionSection } from "../components/sections/CollectionSection";
import { ExperienceSection } from "../components/sections/ExperienceSection";
import { HeroSection } from "../components/sections/HeroSection";
import { NewsletterSection } from "../components/sections/NewsletterSection";
import { StatsStrip } from "../components/sections/StatsStrip";
import { products } from "../data/products";
import { homePageContent } from "../data/siteContent";

export function HomePage() {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const spotlightProducts = products.slice(0, 3);

  return (
    <main className="page-shell page-main">
      <HeroSection hero={homePageContent.hero} />
      <StatsStrip stats={homePageContent.stats} />
      <section className="spotlight-strip">
        {spotlightProducts.map((product) => (
          <article key={product.id} className={`spotlight-card ${product.accent}`}>
            <p className="eyebrow">{product.category}</p>
            <h3>{product.name}</h3>
            <p>{product.variant}</p>
          </article>
        ))}
      </section>
      <CollectionSection heading={homePageContent.homeCollection} products={featuredProducts} />
      <ExperienceSection experience={homePageContent.experience} />
      <NewsletterSection newsletter={homePageContent.newsletter} />
    </main>
  );
}
