import { useMemo, useState } from "react";
import { ProductCard } from "../components/ui/ProductCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { productCategories, products } from "../data/products";
import { parsePrice } from "../utils/price";

const productPrices = products.map((product) => parsePrice(product.price));
const minAvailablePrice = Math.min(...productPrices);
const maxAvailablePrice = Math.max(...productPrices);

function sortProducts(list, sortBy) {
  if (sortBy === "price-asc") {
    return [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  }

  if (sortBy === "price-desc") {
    return [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }

  return [...list].sort((a, b) => b.popularity - a.popularity);
}

export function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [minPrice, setMinPrice] = useState(String(minAvailablePrice));
  const [maxPrice, setMaxPrice] = useState(String(maxAvailablePrice));
  const [sortBy, setSortBy] = useState("popularity");

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const safeMin = Number(minPrice || 0);
    const safeMax = Number(maxPrice || maxAvailablePrice);

    const filtered = products.filter((product) => {
      const productPrice = parsePrice(product.price);
      const matchesSearch = product.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesRange = productPrice >= safeMin && productPrice <= safeMax;

      return matchesSearch && matchesCategory && matchesRange;
    });

    return sortProducts(filtered, sortBy);
  }, [maxPrice, minPrice, searchTerm, selectedCategory, sortBy]);

  return (
    <main className="page-shell page-main">
      <section className="page-hero compact">
        <SectionHeading
          eyebrow="Catálogo"
          title="Explora por categoría, encuentra tonos clave y filtra con criterio."
          description="La tienda ahora ofrece una experiencia de catálogo más realista con búsqueda, filtros por categoría, rango de precio y ordenamiento por valor o popularidad."
        />
      </section>

      <section className="catalog-page">
        <div className="catalog-filters">
          <div className="filter-group">
            <label htmlFor="search">Buscar producto</label>
            <input
              id="search"
              type="search"
              placeholder="Ej. base, lip, blush..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <span>Categorías</span>
            <div className="category-pills">
              {productCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={selectedCategory === category ? "category-pill active" : "category-pill"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="minPrice">Precio mínimo</label>
              <input
                id="minPrice"
                type="number"
                min={minAvailablePrice}
                max={maxAvailablePrice}
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice">Precio máximo</label>
              <input
                id="maxPrice"
                type="number"
                min={minAvailablePrice}
                max={maxAvailablePrice}
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="sortBy">Ordenar por</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="popularity">Popularidad</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="catalog-results">
          <div className="catalog-toolbar">
            <p className="catalog-summary">{visibleProducts.length} productos encontrados</p>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="products-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="eyebrow">Sin coincidencias</p>
              <h3>No encontramos productos con esos filtros.</h3>
              <p>
                Prueba con otra categoría, amplía el rango de precio o usa una búsqueda más corta.
              </p>
              <button
                type="button"
                className="secondary-button reset-button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                  setMinPrice(String(minAvailablePrice));
                  setMaxPrice(String(maxAvailablePrice));
                  setSortBy("popularity");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
