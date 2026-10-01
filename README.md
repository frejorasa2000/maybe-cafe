# Maybe Café — Luxury Dark + Movimiento

Sitio de producción para Maybe Café, construido a partir de la dirección de
diseño "Opción B2 · Luxury Dark + Movimiento" (ver `mockups/`).

## Stack

- **React 19 + Vite** — build y dev server
- **Tailwind CSS v4** — estilos (config en `src/index.css` vía `@theme`)
- **Redux Toolkit** — estado global (menú móvil, cortina de entrada, envío del
  formulario de reseñas)
- **Framer Motion** — todas las animaciones (cortina, scroll-reveal, historia
  con scroll pineado, parallax, cursor personalizado, tilt 3D, botones
  magnéticos)
- **Atomic Design** — `src/components/{atoms,molecules,organisms,templates}`

## Ejecutar en local

```bash
npm install
npm run dev
```

## Formulario de reseñas

El formulario "Cuéntanos tu experiencia" envía un correo a
`maybecoffeetruck@gmail.com` a través de `api/send-review.js` (función
serverless de Vercel, mismo patrón que `send-event-request.js` del sitio
actual), usando la API de Resend. Para que funcione en producción hay que
configurar la variable de entorno `RESEND_API_KEY` en Vercel. En local
(`npm run dev`) esa ruta no existe todavía —hace falta `vercel dev` o el
despliegue real para probarla end-to-end—, así que el formulario mostrará un
mensaje de error y ofrecerá el enlace directo a Google en su lugar.

Esto **no** publica reseñas en Google automáticamente (Google no lo permite
desde un sitio de terceros). El botón "Write a Review / Escribir una reseña"
sí lleva al enlace real del negocio para dejar una reseña pública.

`src/data/reviews.js` tiene las reseñas reales verificadas en Google el
2026-08-31 (Hillary Barrera y Esmeralda Martínez, con su texto original en
inglés) más `REVIEW_SUMMARY` (5.0 · 4 reseñas — Google reporta 4 en total,
pero 2 de ellas no tienen texto escrito, solo calificación). Actualiza ambos
cuando lleguen reseñas nuevas.

## Pedidos online (Square)

Los 16 productos de "Favoritos" (`src/data/menu.js`) se pueden agregar al
carrito. Los precios reales (de las fotos del menú) viven en
`src/data/menuPricing.js`: bebidas en 16 oz / 20 oz, açaí y mini pancakes con
un solo precio. Si cambian, se actualizan solo ahí (el servidor usa esa tabla). Las fotos de `src/assets/images/menu/` están normalizadas (mismo cuadrado y fondo); los originales están en `_originals/`.

Flujo: carrito (Redux, `src/features/cart/`) → botón del carrito en el
header → checkout (`CheckoutModal.jsx`) con el Web Payments SDK de Square
(tarjeta) → `api/create-payment.js` recalcula el total en el servidor (nunca
confía en el monto que manda el navegador) y cobra vía la API de Square;
si `RESEND_API_KEY` está configurada, también envía un correo del pedido a
`maybecoffeetruck@gmail.com`.

Variables de entorno necesarias (copia `.env.example` a `.env.local`):

- `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENV` — servidor,
  nunca se exponen al navegador (el Access Token es secreto).
- `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENV` —
  cliente (el Application ID y Location ID no son secretos, los necesita el
  SDK en el navegador).

Como con el formulario de reseñas, `api/create-payment.js` **no funciona con
`npm run dev`** — hace falta `vercel dev` (o el despliegue real) para probar
el cobro de principio a fin. Mientras tanto sí puedes ver/usar el carrito y
el diseño del checkout con `npm run dev`, solo el paso final de pago
mostrará un error de conexión.

### Correo al cliente cuando cambia el estado del pedido

`api/webhooks/square-order.js` escucha el webhook de Square
`order.fulfillment.updated` (se dispara cada vez que cambias el estado del
pedido — Proposed → Reserved → Prepared → Completed — desde el dashboard o
el POS) y le manda un correo al cliente con ese avance, usando el email que
dejó en el checkout. Requiere `RESEND_API_KEY` configurada.

Para activarlo:

1. En el **Developer Dashboard** de Square → tu app → **Webhooks** (en el
   ambiente Sandbox), crea una suscripción nueva.
2. **Notification URL**: una URL pública que llegue hasta tu `api/webhooks/square-order`.
   `localhost` no sirve — Square necesita poder llamarla desde internet.
   En local usa un túnel (ej. `ngrok http <puerto>`, no viene instalado) y
   apunta a `https://<tu-túnel>.ngrok-free.app/api/webhooks/square-order`;
   en producción sería `https://tu-dominio.vercel.app/api/webhooks/square-order`.
3. **Events**: suscribe a `order.fulfillment.updated` **y** `refund.updated`.
4. Copia la **Signature Key** que te muestra Square a
   `SQUARE_WEBHOOK_SIGNATURE_KEY`, y pon esa misma Notification URL en
   `SQUARE_WEBHOOK_NOTIFICATION_URL` — ambas se usan para verificar que el
   webhook viene realmente de Square.
5. Prueba cambiando el estado del pedido desde el dashboard/POS de Square;
   el correo debería llegar en segundos.

### Reembolsos y cancelaciones

En Square, reembolsar un pago **no** cancela el pedido. Por eso, cuando llega
`refund.updated` con un reembolso total de un pedido que todavía no se
entregó, el webhook pasa el fulfillment a CANCELED: el pedido se ve
cancelado en el dashboard/POS y el cliente recibe el correo "canceled &
refunded". Si el pedido ya estaba completado, o el reembolso es parcial, solo
se le avisa del reembolso. La página `?order=<id>` también muestra el monto
reembolsado y trata un reembolso total como cancelado (aunque el webhook no
esté configurado). La lógica compartida con Square vive en `api/_lib/square.js`.

### Horario de pedidos en línea

`src/data/businessHours.js` define cuándo se aceptan pedidos (hora de Nueva
York, sin importar dónde esté el cliente) y deja de aceptarlos
`LAST_ORDER_MINUTES_BEFORE_CLOSE` (15) minutos antes de cerrar. Fuera de
horario, los botones de agregar y pagar se desactivan con un aviso de cuándo
abrimos, y `api/create-payment.js` rechaza el pedido igual (no se puede saltar
desde el navegador). Si cambia el horario, actualízalo ahí **y** en
`src/i18n/content.js` (`visit.hours`), que es el texto que se muestra.

### Tiempo estimado del pedido

`src/data/estimatedTime.js` centraliza el cálculo: 3 minutos por artículo
(`MINUTES_PER_ITEM`). Ese total se guarda en los metadatos del Order de
Square al crearlo (`estimated_minutes`) y `api/order-status.js` calcula
cuánto queda según el estado del fulfillment (100% en Proposed, 60% en
Reserved, 0 en Prepared/Completed). La página `?order=<id>` (`OrderStatusPage.jsx`)
hace polling cada 15s mientras el pedido no llegue a un estado final, así el
tiempo restante se actualiza solo a medida que cambias el estado en Square.

## Idiomas

El sitio es **en inglés por defecto**, con un botón EN/ES en el header (y en
el menú móvil) que cambia todo el contenido al instante — sin recargar la
página. Los textos viven en `src/i18n/content.js` (un objeto por idioma) y
cada componente los lee con el hook `useT()`. Las reseñas de clientes NO se
traducen (se muestran en su idioma original, igual que hace Google).

## Menú vs. Favoritos vs. Galería

- **Favoritos** (`#favorites`, `MenuSection.jsx`): los 8 platos destacados
  con foto y descripción — lo que antes se llamaba "menú" en la primera
  versión.
- **Menú** (`#menu`, `FullMenuSection.jsx`): el menú real fotografiado
  (`Menu1`, `Menu2`, `Toppings`) con precios, tal como lo tenías. Clic en una
  imagen la abre en grande (`Lightbox.jsx`).
- **Galería** (`#gallery`, `GallerySection.jsx`): carrusel de fotos deslizable
  (arrastrar con el dedo en celular, o con el mouse) que da la vuelta al
  llegar al final. Usa las fotos que ya teníamos; se puede ampliar la lista
  de imágenes en el propio archivo.

## Horario

Se edita en `src/i18n/content.js`, dentro de `visit.hours` de cada idioma.
El día actual se resalta en automático en la sección "Visit/Visítanos".

## Estructura

```
api/                       funciones serverless (Vercel)
src/
  app/store.js             configuración de Redux
  i18n/content.js           textos en inglés y español
  features/                 slices de Redux (ui: idioma/menú móvil/cortina; reviews: envío de reseña)
  data/                     contenido real del negocio (menú, horario, reseñas)
  hooks/                    usePointerFine, useT
  components/
    atoms/                  Button, Reveal, TiltCard, CustomCursor, íconos...
    molecules/              DishListItem, StoryBlock, ReviewCard, LanguageToggle...
    organisms/              Header, Hero, StorySection, FullMenuSection, GallerySection, ReviewsSection...
    templates/HomeTemplate.jsx
  pages/HomePage.jsx
mockups/                    las 5 direcciones de diseño exploradas antes de
                            construir esta versión — se dejaron intactas
```
