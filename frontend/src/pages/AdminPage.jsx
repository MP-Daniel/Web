import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  createAdminProduct,
  getAdminOrders,
  getAdminProducts,
  updateAdminOrderStatus,
  updateAdminStock,
} from "../services/api";
import { formatPrice } from "../utils/price";

const initialForm = {
  name: "",
  category: "Labios",
  price: "",
  shortDescription: "",
  longDescription: "",
  accent: "rose",
  tag: "Nuevo",
  popularity: "80",
  variant: "",
  benefits: "",
  ingredients: "",
  visualStyle: "bottle",
  visualLabel: "",
  visualNote: "",
  imageUrl: "",
  variants: "Universal:10",
};

const adminSections = [
  { id: "dashboard", label: "Resumen" },
  { id: "products", label: "Crear producto" },
  { id: "inventory", label: "Inventario" },
  { id: "orders", label: "Pedidos" },
];

const orderStatuses = [
  { value: "pending_whatsapp", label: "Pendiente WhatsApp" },
  { value: "confirmed", label: "Confirmado" },
  { value: "paid", label: "Pagado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const statusLabels = Object.fromEntries(orderStatuses.map((status) => [status.value, status.label]));

function toList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVariants(value, fallbackPrice) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, stock = "0"] = item.split(":").map((part) => part.trim());

      return {
        name,
        shade: name,
        price: fallbackPrice,
        stock: Number(stock),
      };
    });
}

function optionalValue(value) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function getVariantInventory(variant) {
  const inventory = Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory;
  const stock = inventory?.stock ?? 0;
  const reservedStock = inventory?.reserved_stock ?? 0;

  return {
    stock,
    reservedStock,
    availableStock: Math.max(stock - reservedStock, 0),
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminPage() {
  const { logout, token, user } = useAdminAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockDrafts, setStockDrafts] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const inventoryRows = useMemo(
    () =>
      products.flatMap((product) =>
        (product.product_variants ?? []).map((variant) => ({
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          sku: variant.sku,
          ...getVariantInventory(variant),
        })),
      ),
    [products],
  );

  const dashboard = useMemo(() => {
    const pendingOrders = orders.filter((order) => order.status === "pending_whatsapp").length;
    const lowStock = inventoryRows.filter((row) => row.availableStock <= 5).length;
    const totalStock = inventoryRows.reduce((total, row) => total + row.stock, 0);

    return {
      products: products.length,
      pendingOrders,
      lowStock,
      totalStock,
    };
  }, [inventoryRows, orders, products.length]);

  async function loadAdminData() {
    setLoadingData(true);
    setMessage("");

    try {
      const [productsPayload, ordersPayload] = await Promise.all([
        getAdminProducts(token),
        getAdminOrders(token),
      ]);

      setProducts(productsPayload.products ?? []);
      setOrders(ordersPayload.orders ?? []);
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [token]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const price = Number(form.price);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        price,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        accent: form.accent,
        tag: form.tag,
        popularity: Number(form.popularity),
        variant: form.variant || "Edicion principal",
        benefits: toList(form.benefits),
        ingredients: toList(form.ingredients),
        visualStyle: form.visualStyle,
        visualLabel: optionalValue(form.visualLabel) || form.name,
        visualNote: optionalValue(form.visualNote) || optionalValue(form.variant),
        imageUrl: optionalValue(form.imageUrl),
        variants: parseVariants(form.variants, price),
      };

      await createAdminProduct({
        token,
        product: payload,
      });

      setStatus("success");
      setMessage("Producto creado correctamente en Supabase.");
      setForm(initialForm);
      await loadAdminData();
      setActiveSection("inventory");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function handleStockUpdate(row) {
    const draftValue = stockDrafts[row.variantId];
    const nextStock = Number(draftValue ?? row.stock);

    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setStatus("error");
      setMessage("El stock debe ser un numero entero mayor o igual a 0.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await updateAdminStock({
        token,
        productId: row.productId,
        variants: [{ variantId: row.variantId, stock: nextStock }],
      });

      setStatus("success");
      setMessage(`Stock actualizado para ${row.productName} - ${row.variantName}.`);
      await loadAdminData();
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function handleOrderStatusChange(order, nextStatus) {
    if (order.status === nextStatus) {
      return;
    }

    const shouldContinue = window.confirm(
      `Vas a cambiar el pedido ${order.id} de "${statusLabels[order.status]}" a "${statusLabels[nextStatus]}". Si confirmas/pagas/entregas se descuenta inventario; si cancelas se devuelve si ya habia descontado. Deseas continuar?`,
    );

    if (!shouldContinue) {
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await updateAdminOrderStatus({
        token,
        orderId: order.id,
        status: nextStatus,
      });

      setStatus("success");
      setMessage("Estado del pedido actualizado correctamente.");
      await loadAdminData();
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <main className="page-shell page-main">
      <section className="admin-page">
        <div className="section-heading stack">
          <div>
            <p className="section-tag">Panel admin</p>
            <h2>Operaciones, inventario y pedidos de Della.</h2>
          </div>
          <p>Sesión activa como {user?.username}. Todo este panel esta protegido con JWT.</p>
        </div>

        <div className="admin-topbar">
          <nav className="admin-menu" aria-label="Menu del administrador">
            {adminSections.map((section) => (
              <button
                className={activeSection === section.id ? "active" : ""}
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="admin-actions">
            <button className="secondary-button" type="button" onClick={loadAdminData}>
              Actualizar datos
            </button>
            <button className="secondary-button" type="button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {message ? <p className={`admin-message ${status}`}>{message}</p> : null}

        {loadingData ? <p className="admin-loading">Cargando informacion del negocio...</p> : null}

        {activeSection === "dashboard" ? (
          <section className="admin-section">
            <div className="admin-stats-grid">
              <article>
                <span>Productos activos</span>
                <strong>{dashboard.products}</strong>
              </article>
              <article>
                <span>Pedidos pendientes</span>
                <strong>{dashboard.pendingOrders}</strong>
              </article>
              <article>
                <span>Variantes bajo stock</span>
                <strong>{dashboard.lowStock}</strong>
              </article>
              <article>
                <span>Unidades en inventario</span>
                <strong>{dashboard.totalStock}</strong>
              </article>
            </div>

            <div className="admin-flow-card">
              <p className="section-tag">Flujo recomendado</p>
              <h3>WhatsApp no descuenta por abrir el chat.</h3>
              <p>
                Cuando el cliente confirma por WhatsApp, cambia el pedido a Confirmado o Pagado. En
                ese momento se descuenta inventario una sola vez. Si cancelas el pedido despues de
                confirmarlo, el stock se devuelve automaticamente.
              </p>
            </div>
          </section>
        ) : null}

        {activeSection === "products" ? (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" value={form.name} onChange={updateField} required />
            </div>

            <div className="form-row">
              <label htmlFor="category">Categoria</label>
              <select id="category" name="category" value={form.category} onChange={updateField}>
                <option>Labios</option>
                <option>Rostro</option>
                <option>Ojos</option>
                <option>Cejas</option>
                <option>Skincare</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="price">Precio COP</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="tag">Etiqueta</label>
              <input id="tag" name="tag" value={form.tag} onChange={updateField} required />
            </div>

            <div className="form-row">
              <label htmlFor="accent">Color visual</label>
              <select id="accent" name="accent" value={form.accent} onChange={updateField}>
                <option value="rose">Rose</option>
                <option value="sand">Sand</option>
                <option value="gold">Gold</option>
                <option value="espresso">Espresso</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="popularity">Popularidad</label>
              <input
                id="popularity"
                name="popularity"
                type="number"
                min="0"
                max="100"
                value={form.popularity}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-row full">
              <label htmlFor="shortDescription">Descripcion corta</label>
              <input
                id="shortDescription"
                name="shortDescription"
                value={form.shortDescription}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-row full">
              <label htmlFor="longDescription">Descripcion larga</label>
              <textarea
                id="longDescription"
                name="longDescription"
                rows="4"
                value={form.longDescription}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="variant">Variante principal</label>
              <input id="variant" name="variant" value={form.variant} onChange={updateField} />
            </div>

            <div className="form-row">
              <label htmlFor="variants">Tonos y stock</label>
              <input
                id="variants"
                name="variants"
                value={form.variants}
                onChange={updateField}
                placeholder="Rose Nude:10, Berry:5"
                required
              />
            </div>

            <div className="form-row full">
              <label htmlFor="benefits">Beneficios separados por coma</label>
              <input
                id="benefits"
                name="benefits"
                value={form.benefits}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-row full">
              <label htmlFor="ingredients">Ingredientes separados por coma</label>
              <input
                id="ingredients"
                name="ingredients"
                value={form.ingredients}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="visualStyle">Placeholder visual</label>
              <select
                id="visualStyle"
                name="visualStyle"
                value={form.visualStyle}
                onChange={updateField}
              >
                <option value="bottle">Bottle</option>
                <option value="lipstick">Lipstick</option>
                <option value="palette">Palette</option>
                <option value="compact">Compact</option>
                <option value="tube">Tube</option>
                <option value="jar">Jar</option>
                <option value="pencil">Pencil</option>
                <option value="wand">Wand</option>
                <option value="spray">Spray</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="visualLabel">Texto visual</label>
              <input
                id="visualLabel"
                name="visualLabel"
                value={form.visualLabel}
                onChange={updateField}
              />
            </div>

            <div className="form-row">
              <label htmlFor="visualNote">Nota visual</label>
              <input
                id="visualNote"
                name="visualNote"
                value={form.visualNote}
                onChange={updateField}
              />
            </div>

            <div className="form-row">
              <label htmlFor="imageUrl">URL imagen opcional</label>
              <input id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={updateField} />
            </div>

            <button
              className="primary-button form-button full"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Creando producto..." : "Crear producto"}
            </button>
          </form>
        ) : null}

        {activeSection === "inventory" ? (
          <section className="admin-section">
            <div className="admin-table-card">
              <div className="admin-table-heading">
                <div>
                  <p className="section-tag">Inventario</p>
                  <h3>Stock por producto y variante</h3>
                </div>
                <p>Disponible = stock menos reservado. Edita el stock real cuando recibas mercancia.</p>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Variante</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Reservado</th>
                      <th>Disponible</th>
                      <th>Nuevo stock</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRows.map((row) => (
                      <tr key={row.variantId}>
                        <td>{row.productName}</td>
                        <td>{row.variantName}</td>
                        <td>{row.sku}</td>
                        <td>{row.stock}</td>
                        <td>{row.reservedStock}</td>
                        <td>
                          <span className={row.availableStock <= 5 ? "stock-pill danger" : "stock-pill"}>
                            {row.availableStock}
                          </span>
                        </td>
                        <td>
                          <input
                            className="stock-input"
                            min="0"
                            type="number"
                            value={stockDrafts[row.variantId] ?? row.stock}
                            onChange={(event) =>
                              setStockDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [row.variantId]: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="secondary-button compact-button"
                            type="button"
                            onClick={() => handleStockUpdate(row)}
                          >
                            Guardar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "orders" ? (
          <section className="admin-section">
            <div className="admin-table-card">
              <div className="admin-table-heading">
                <div>
                  <p className="section-tag">Pedidos</p>
                  <h3>Confirmacion manual y control de entrega</h3>
                </div>
                <p>Confirma despues de hablar por WhatsApp. El inventario se descuenta al confirmar, pagar o entregar.</p>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Cambiar estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <button
                            className="order-link"
                            type="button"
                            onClick={() =>
                              setSelectedOrderId((currentId) =>
                                currentId === order.id ? null : order.id,
                              )
                            }
                          >
                            {order.id.slice(0, 8)}
                          </button>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <span className={`order-status ${order.status}`}>
                            {statusLabels[order.status] ?? order.status}
                          </span>
                        </td>
                        <td>{formatPrice(order.total_amount ?? 0)}</td>
                        <td>{order.order_items?.length ?? 0}</td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(event) => handleOrderStatusChange(order, event.target.value)}
                          >
                            {orderStatuses.map((statusOption) => (
                              <option key={statusOption.value} value={statusOption.value}>
                                {statusOption.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrderId ? (
                <div className="order-detail-card">
                  <h4>Detalle del pedido {selectedOrderId.slice(0, 8)}</h4>
                  {(orders.find((order) => order.id === selectedOrderId)?.order_items ?? []).map((item) => (
                    <p key={item.id}>
                      {item.products?.name ?? "Producto"} - {item.product_variants?.name ?? "Variante"} x
                      {item.quantity}: {formatPrice(item.line_total ?? 0)}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
