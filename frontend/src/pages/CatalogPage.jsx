import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ui/ProductCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { getProducts } from "../services/api";

const productCategories = ["Todos", "Labios", "Rostro", "Ojos", "Cejas", "Skincare"];

export function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const apiProducts = await getProducts({
          search: searchTerm,
          category: selectedCategory,
          minPrice,
          maxPrice,
          sort: sortBy,
        });

        if (!controller.signal.aborted) {
          setProducts(apiProducts);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError.message);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [maxPrice, minPrice, searchTerm, selectedCategory, sortBy]);

  const visibleProducts = useMemo(() => products, [products]);

  return (
    <main className="page-shell page-main">
      <section className="page-hero compact">
        <SectionHeading
          eyebrow="Catálogo"
          title="Explora por categoría, encuentra tonos clave y filtra con criterio."
          description="La tienda ahora consulta productos reales desde el backend conectado a Supabase."
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
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice">Precio máximo</label>
              <input
                id="maxPrice"
                type="number"
                min="0"
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
            <p className="catalog-summary">
              {isLoading ? "Cargando productos..." : `${visibleProducts.length} productos encontrados`}
            </p>
          </div>

          {error ? (
            <div className="empty-state">
              <p className="eyebrow">Error de conexión</p>
              <h3>No pudimos cargar el catálogo.</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {isLoading && !error ? (
            <div className="empty-state">
              <p className="eyebrow">Cargando</p>
              <h3>Consultando productos desde Supabase.</h3>
              <p>Estamos preparando el catálogo actualizado.</p>
            </div>
          ) : null}

          {!isLoading && !error && visibleProducts.length > 0 ? (
            <div className="products-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}

          {!isLoading && !error && visibleProducts.length === 0 ? (
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
                  setMinPrice("");
                  setMaxPrice("");
                  setSortBy("popularity");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
