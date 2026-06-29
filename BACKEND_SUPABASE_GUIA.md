# Backend y Supabase para Della shop

Esta guia explica como conectar el proyecto a Supabase, como correr el backend y como manejar pedidos por WhatsApp.

## 1. Stack recomendado

El proyecto queda asi:

- Frontend: React + Vite.
- Backend: Express en `server/`.
- Base de datos: Supabase PostgreSQL.
- Seguridad: variables `.env`, service role solo en backend, RLS en Supabase, CORS, Helmet y rate limit.
- Checkout inicial: redireccion a WhatsApp con el carrito.

## 2. Crear proyecto en Supabase

1. Entra a Supabase y crea un proyecto.
2. Ve a `Project Settings > API`.
3. Copia:
   - `Project URL`
   - `service_role key`
4. La `service_role key` nunca debe ir en React ni en el navegador.

## 3. Crear las tablas

En Supabase, abre `SQL Editor`.

Ejecuta el contenido de:

```text
supabase/schema.sql
```

Ese archivo crea:

- `products`
- `product_variants`
- `inventory`
- `orders`
- `order_items`

Tambien activa RLS. Los productos activos se pueden leer publicamente, pero los pedidos no se pueden leer ni escribir desde el navegador. Los pedidos los crea el backend.

## 4. Crear el archivo .env

Crea un archivo llamado `.env` en la raiz del proyecto usando `.env.example` como base.

Ejemplo:

```env
VITE_API_URL=http://localhost:4000/api
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
WHATSAPP_PHONE_NUMBER=573001234567
WHATSAPP_DEFAULT_MESSAGE_PREFIX=Hola, quiero hacer este pedido en Lumina:
CREATE_PENDING_WHATSAPP_ORDERS=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=pon-una-contrasena-privada
JWT_SECRET=pon-un-secreto-largo-y-privado
JWT_EXPIRES_IN=2h
```

Importante: `.env` esta en `.gitignore`, no lo subas a GitHub.

## 5. Subir los productos actuales a Supabase

Despues de configurar `.env` y ejecutar el SQL:

```bash
npm run db:seed
```

Ese comando toma los productos de `src/data/products.js` y los sube a Supabase con variantes e inventario inicial de 10 unidades.

Luego puedes editar stock, precios e imagenes directamente en Supabase.

## 6. Correr frontend y backend

Para correr solo el frontend:

```bash
npm run dev
```

Para correr solo el backend:

```bash
npm run dev:api
```

Para correr ambos al tiempo:

```bash
npm run dev:all
```

Backend local:

```text
http://localhost:4000/api
```

Swagger local:

```text
http://localhost:4000/api/docs
```

Panel admin local:

```text
http://localhost:5173/admin
```

Para usarlo, entra con el usuario y contraseña configurados en `ADMIN_USERNAME` y `ADMIN_PASSWORD`.

Frontend local:

```text
http://localhost:5173
```

## 7. Endpoints del backend

Estado de la API:

```http
GET /api/health
```

Productos:

```http
GET /api/products
GET /api/products?category=Labios&sort=price-asc
GET /api/products/:idOrSlug
```

Checkout por WhatsApp:

```http
POST /api/checkout/whatsapp
```

Body de ejemplo:

```json
{
  "customer": {
    "name": "Daniel",
    "phone": "3001234567",
    "notes": "Entrega en la tarde"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

Respuesta:

```json
{
  "orderId": "uuid-del-pedido",
  "totalAmount": 179800,
  "whatsappUrl": "https://wa.me/..."
}
```

## 8. Sobre WhatsApp y pagos

Para empezar, lo mas simple es usar un link `wa.me`. Eso no requiere pagar API. El usuario da clic en pagar, se abre WhatsApp con el mensaje del pedido y tu confirmas manualmente.

Eso sirve bien si estas empezando, pero no es un pago automatico. El stock no deberia descontarse definitivamente hasta que tu confirmes el pago.

Mas adelante puedes usar:

- Wompi si vas a vender principalmente en Colombia.
- Mercado Pago si quieres una opcion conocida en Latinoamerica.
- Stripe si luego quieres algo mas internacional.

Cuando agregues pagos reales, lo correcto es:

1. Crear pedido pendiente.
2. Redirigir a pasarela de pago.
3. Recibir webhook de pago aprobado.
4. Descontar inventario en base de datos.
5. Marcar pedido como pagado.

## 9. Como manejar inventario

El inventario vive en la tabla `inventory`.

Campos importantes:

- `stock`: unidades reales disponibles.
- `reserved_stock`: unidades temporalmente apartadas.

Para WhatsApp, recomiendo no descontar stock automaticamente al abrir WhatsApp. Mejor crea un pedido `pending_whatsapp` y descuentas o ajustas stock cuando confirmes manualmente.

Para pagos online reales, si se debe descontar con una funcion/transaccion cuando el pago sea aprobado.
