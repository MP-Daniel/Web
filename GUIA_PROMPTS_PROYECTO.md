# Guia de Prompts para Mejorar la Tienda Online de Maquillaje

Este documento te sirve para probar tu agente local paso a paso sobre el proyecto de la tienda online de maquillaje.

La idea es que no le pases todo de una sola vez, sino por fases. Asi puedes ver mejor como piensa, como modifica el codigo y que tan bien resuelve cada parte.

En cada seccion tienes:

- El nombre del prompt.
- Para que sirve.
- Que deberia mejorar el agente.
- Que revisar cuando termine.
- Un espacio para poner capturas de pantalla.

---

## 1. Mejorar estructura general

### Objetivo
Este prompt sirve para que el agente organice mejor el proyecto antes de seguir agregando funciones.

### Que se espera
- Separacion del codigo en componentes reutilizables.
- Mejor orden entre datos, secciones y estilos.
- Una base mas profesional para seguir construyendo.

### Que revisar al terminar
- Si el proyecto quedo mas limpio.
- Si ahora hay carpetas o componentes mejor organizados.
- Si el diseno sigue funcionando bien.
- Si el build sigue pasando.

### Prompt sugerido
```text
Quiero que mejores este proyecto React + Vite de una tienda online de maquillaje. Primero analiza la estructura actual y reorganiza el código para que quede más profesional y mantenible.

Objetivos:
- Separar la UI en componentes reutilizables.
- Mover los datos a una estructura más clara.
- Mantener el diseño actual o mejorarlo sin empeorarlo.
- No romper la compilación.

Criterios de terminado:
- El proyecto debe seguir funcionando con npm run build.
- Debe quedar una estructura limpia de componentes, secciones y datos.
- Explícame qué cambiaste y por qué.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 2. Convertirlo en ecommerce mas real

### Objetivo
Este prompt hace que el proyecto deje de parecer solo una landing y empiece a comportarse mas como una tienda real.

### Que se espera
- Mas productos.
- Categorias utiles.
- Botones de carrito con comportamiento.
- Un estado general para manejar compras.

### Que revisar al terminar
- Si se pueden agregar productos.
- Si aparece un contador de carrito.
- Si la tienda se siente mas completa.

### Prompt sugerido
```text
Convierte esta landing de maquillaje en una tienda online más realista.

Quiero:
- Listado de productos más completo.
- Categorías como labios, rostro, ojos, cejas y skincare.
- Botones funcionales de agregar al carrito.
- Estado global simple para carrito.
- Indicador de cantidad de productos en el carrito.

Criterios:
- Usa React limpio y simple.
- No agregues backend todavía.
- El proyecto debe seguir compilando.
- Al final resume las mejoras implementadas.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 3. Crear carrito funcional

### Objetivo
Este prompt se enfoca solo en el carrito para probar si el agente puede construir logica util sin romper la interfaz.

### Que se espera
- Agregar productos.
- Cambiar cantidades.
- Eliminar productos.
- Calcular totales.
- Guardar el carrito en localStorage.

### Que revisar al terminar
- Si el carrito mantiene los productos al recargar.
- Si los calculos son correctos.
- Si la interfaz sigue viendose bien.

### Prompt sugerido
```text
Implementa un carrito de compras funcional en este proyecto.

Necesito:
- Agregar productos al carrito.
- Aumentar o disminuir cantidades.
- Eliminar productos.
- Mostrar subtotal y total.
- Persistir el carrito en localStorage.

Condiciones:
- Mantén una UI elegante y consistente con la tienda de maquillaje.
- No uses librerías innecesarias.
- Verifica que npm run build funcione al final.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 4. Anadir filtros y busqueda

### Objetivo
Este prompt sirve para evaluar como resuelve interaccion de usuario y manejo de estado en catalogos.

### Que se espera
- Busqueda por nombre.
- Filtro por categoria.
- Filtro por precio.
- Ordenamiento.
- Mensaje visual cuando no haya resultados.

### Que revisar al terminar
- Si los filtros combinan bien entre si.
- Si la busqueda responde correctamente.
- Si el estado vacio se ve cuidado y profesional.

### Prompt sugerido
```text
Mejora la experiencia de catálogo de esta tienda online.

Implementa:
- Buscador por nombre de producto.
- Filtros por categoría.
- Filtro por rango de precio.
- Ordenar por precio o popularidad.
- Estado vacío bonito cuando no haya resultados.

Importante:
- Haz una interfaz visualmente profesional.
- Mantén buen responsive.
- No rompas la estructura existente si ya está bien organizada.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 5. Crear paginas internas

### Objetivo
Este prompt convierte el proyecto en una aplicacion mas completa con navegacion real.

### Que se espera
- Varias paginas conectadas.
- Uso de rutas.
- Navegacion clara.
- Mejor estructura visual del sitio.

### Que revisar al terminar
- Si todas las paginas abren.
- Si el menu funciona.
- Si el estilo es consistente entre pantallas.

### Prompt sugerido
```text
Quiero que conviertas este proyecto en una mini tienda con varias páginas usando React Router.

Crea estas páginas:
- Inicio
- Catálogo
- Producto detalle
- Carrito
- Nosotros
- Contacto

Requisitos:
- Navegación funcional.
- Cada página debe tener diseño coherente con la marca.
- La página de detalle debe mostrar información más completa del producto.
- Todo debe seguir compilando correctamente.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 6. Mejorar diseno visual premium

### Objetivo
Este prompt es ideal para probar la parte estetica del agente y ver si realmente sabe elevar una interfaz.

### Que se espera
- Mejor jerarquia visual.
- Mejor uso de color.
- Secciones mas llamativas.
- Responsive cuidado.
- Animaciones suaves.

### Que revisar al terminar
- Si el resultado se ve premium de verdad.
- Si no parece una plantilla generica.
- Si en movil sigue funcionando bien.

### Prompt sugerido
```text
Quiero que eleves mucho el diseño visual de esta tienda online de maquillaje para que se vea más premium y profesional.

Mejoras esperadas:
- Mejor tipografía y jerarquía visual.
- Mejor uso de color, fondos y tarjetas.
- Secciones con más intención de marca.
- Mejor responsive en móvil.
- Microinteracciones suaves y elegantes.

Importante:
- No hagas un diseño genérico.
- Debe sentirse como una marca de cosméticos moderna y aspiracional.
- Mantén el proyecto funcional y compilando.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 7. Agregar datos realistas de productos

### Objetivo
Este prompt mejora el contenido del ecommerce para que se sienta mas creible y util.

### Que se espera
- Mas productos.
- Informacion mas detallada.
- Variantes o tonos.
- Etiquetas como nuevo o bestseller.

### Que revisar al terminar
- Si el catalogo se ve coherente.
- Si los nombres y precios tienen sentido.
- Si ya parece una tienda mas seria.

### Prompt sugerido
```text
Quiero que reemplaces los productos de ejemplo por un catálogo más completo y realista para una tienda de maquillaje.

Incluye:
- Al menos 12 productos.
- Nombre, categoría, precio, descripción corta, descripción larga, tono o variante, y etiqueta como nuevo o bestseller.
- Imágenes simuladas con placeholders visuales elegantes si no hay assets reales.
- Productos coherentes con una marca de belleza premium.

Mantén:
- Buen diseño.
- Código limpio.
- Build funcionando.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 8. Anadir seccion de producto detalle

### Objetivo
Este prompt prueba si el agente puede crear una vista importante de ecommerce con informacion y estructura mas completa.

### Que se espera
- Vista principal del producto.
- Precio y descripcion.
- Beneficios e ingredientes.
- Tonos disponibles.
- Relacionados.

### Que revisar al terminar
- Si la pagina da informacion suficiente.
- Si el bloque visual del producto se ve bien.
- Si invita a comprar.

### Prompt sugerido
```text
Implementa una vista de detalle de producto profesional.

Quiero:
- Imagen principal o mock visual del producto.
- Nombre, precio, descripción, beneficios, ingredientes destacados y tonos disponibles.
- Selector de cantidad.
- Botón agregar al carrito.
- Productos relacionados al final.

Hazlo visualmente elegante y consistente con la tienda actual.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 9. Hacer version lista para portafolio

### Objetivo
Este prompt sirve para pulir el proyecto y dejarlo con mejor calidad de presentacion.

### Que se espera
- Mejor escritura de textos.
- Nombres mas profesionales en componentes.
- Menos apariencia de demo.
- Mas sensacion de proyecto terminado.

### Que revisar al terminar
- Si el sitio se siente mas serio.
- Si el texto de marca mejoro.
- Si el codigo y la presentacion quedaron mas solidos.

### Prompt sugerido
```text
Quiero que transformes este proyecto en una versión más sólida para portafolio.

Haz lo siguiente:
- Revisa y mejora textos de marketing.
- Mejora naming de componentes.
- Elimina cualquier parte que se vea de demo simple.
- Añade una experiencia más pulida y profesional.
- Deja el código ordenado y fácil de presentar.

Al final:
- Resume qué partes mejoraste.
- Confirma si npm run build pasó correctamente.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 10. Agregar backend falso o mock API

### Objetivo
Este prompt ayuda a probar si el agente puede mejorar la arquitectura sin necesidad de usar un backend real.

### Que se espera
- Datos separados.
- Simulacion de carga.
- Estado de loading.
- Estado de error.
- Preparacion para una API real despues.

### Que revisar al terminar
- Si los productos se cargan como si vinieran de una fuente externa.
- Si hay una experiencia visual mientras carga.
- Si el codigo queda listo para crecer.

### Prompt sugerido
```text
Quiero que prepares este proyecto para que parezca una app más real.

Haz una capa de datos tipo mock API:
- Mueve los productos a una fuente de datos separada.
- Simula fetch de productos.
- Agrega estados de loading y error.
- Mantén todo local, sin backend real.

Objetivo:
- Que el proyecto se vea más profesional técnicamente.
- Que sea fácil reemplazar luego por una API real.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 11. Anadir panel de checkout simple

### Objetivo
Este prompt sirve para probar un flujo mas completo de compra dentro del ecommerce.

### Que se espera
- Resumen del pedido.
- Formulario del cliente.
- Direccion de envio.
- Metodo de pago simulado.
- Confirmacion final.

### Que revisar al terminar
- Si el flujo se entiende.
- Si los formularios se ven ordenados.
- Si la experiencia se siente realista.

### Prompt sugerido
```text
Crea un flujo básico de checkout para esta tienda.

Incluye:
- Resumen del pedido.
- Formulario de cliente.
- Dirección de envío.
- Método de pago simulado.
- Confirmación de compra simulada.

No conectes pagos reales.
Haz una experiencia limpia, moderna y creíble.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## 12. Mejorar calidad tecnica

### Objetivo
Este prompt se usa para una revision mas seria de codigo y mantenimiento.

### Que se espera
- Limpieza de componentes.
- Menos repeticion.
- Mejor organizacion.
- Ajustes responsive.
- Mejor legibilidad general.

### Que revisar al terminar
- Si el proyecto se ve mas ordenado internamente.
- Si hay menos codigo repetido.
- Si el build sigue funcionando.

### Prompt sugerido
```text
Quiero que revises este proyecto como si fueras un desarrollador senior y lo mejores técnicamente.

Haz:
- Limpieza de componentes.
- Mejor organización de carpetas.
- Revisión de estilos repetidos.
- Mejora de legibilidad.
- Ajustes de responsive si hacen falta.
- Verificación final con build.

No cambies cosas solo por cambiar.
Prioriza calidad real y mantenibilidad.
```

### Espacio para capturas

Captura 1:



Captura 2:



---

## Orden recomendado para probar al agente

Si quieres evaluar mejor al agente, puedes pasarle los prompts en este orden:

1. Mejorar estructura general
2. Convertirlo en ecommerce mas real
3. Crear carrito funcional
4. Anadir filtros y busqueda
5. Crear paginas internas
6. Anadir seccion de producto detalle
7. Anadir panel de checkout simple
8. Mejorar diseno visual premium
9. Hacer version lista para portafolio
10. Mejorar calidad tecnica

---

## Notas personales

Aqui puedes escribir observaciones despues de cada prueba:

- Que resolvio bien:


- Que resolvio mal:


- Que rompio:


- Que prompt funciono mejor:


- Que comportamiento del agente te llamo la atencion:


