import { ProductCard } from "../ui/ProductCard";
import { SectionHeading } from "../ui/SectionHeading";

export function CollectionSection({ heading, products }) {
  return (
    <section className="collection-section">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
