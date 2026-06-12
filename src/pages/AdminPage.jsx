import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { createAdminProduct } from "../services/api";

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

export function AdminPage() {
  const { logout, token, user } = useAdminAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

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
            <h2>Crear productos y stock inicial desde la interfaz.</h2>
          </div>
          <p>Sesión activa como {user?.username}. Los cambios se guardan en Supabase.</p>
        </div>

        <div className="admin-actions">
          <button className="secondary-button" type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>

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

          <button className="primary-button form-button full" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creando producto..." : "Crear producto"}
          </button>

          {message ? <p className={`admin-message ${status}`}>{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
