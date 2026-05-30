import { CartSection } from "../components/sections/CartSection";

export function CartPage() {
  return (
    <main className="page-shell page-main">
      <CartSection
        eyebrow="Carrito"
        title="Revisa, ajusta y confirma tu selección antes del checkout."
        description="Aquí puedes subir o bajar cantidades, eliminar referencias y confirmar el valor total de tu compra sin perder claridad visual."
      />
    </main>
  );
}
