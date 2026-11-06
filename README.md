# BOHEMIOS — Carta digital interactiva

Web estática para **BOHEMIOS Resto Bar – Pizzería**, lista para publicar en **GitHub Pages**. Incluye los **141 productos y 13 categorías** de `CARTA BOHEMIOS 2026.docx`.

## Organización de las cuatro carpetas

```text
BOHEMIOS_CARTA_DIGITAL/
├── index.html            ← Página principal
├── README.md             ← Estas instrucciones
├── css/
│   └── estilos.css       ← Colores, diseño, adaptación móvil y animaciones
├── js/
│   └── app.js            ← Secciones, variantes, opciones, carrito, validación y WhatsApp
├── datos/
│   └── menu.js           ← Los 141 productos, precios, opciones y datos del negocio
└── img/
    ├── logo-original.png ← Logo compartido por el negocio
    ├── hero-night.svg    ← Ilustración del encabezado
    ├── favicon.svg
    └── productos/         ← 211 ilustraciones WebP reemplazables por fotos reales
```

## Cómo subirlo a GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `carta-bohemios`.
2. Abre el repositorio, selecciona **Add file → Upload files**.
3. **Descomprime el ZIP** y arrastra **todo lo que está dentro de BOHEMIOS_CARTA_DIGITAL**. `index.html` debe quedar en la **raíz**, no dentro de otra carpeta.
4. Haz clic en **Commit changes**.
5. En el repositorio abre **Settings → Pages → Build and deployment → Deploy from a branch**. Elige `main` y `/ (root)`. Guarda.
6. En unos momentos GitHub mostrará la URL `https://TUUSUARIO.github.io/carta-bohemios/` (el nombre real depende de tu cuenta/repositorio). Esta URL es un **ejemplo**, no un enlace publicado.

**IMPORTANTE:** GitHub Pages es estático; no necesita base de datos para el carrito. Al enviar, abre WhatsApp con el pedido escrito. El cliente **debe presionar Enviar** en WhatsApp. El sitio no cobra ni registra pagos automáticamente.

## Cambiar precios, fotos, celular y dirección

- Precios, descripciones, tamaños, sabores, salsas e imágenes: `datos/menu.js`.
- Teléfono WhatsApp: busca `"phone": "51945483809"` en `datos/menu.js` (prefijo 51 = Perú).
- Dirección: busca `"address"` en `datos/menu.js`. Si cambia la ubicación, cambia también los enlaces y el iframe de Google Maps en `index.html`.
- Fotos: `img/productos/`. Puedes reemplazar las ilustraciones existentes por fotografías reales con **el mismo nombre**. Las ilustraciones no son fotos reales.
- Diseño: `css/estilos.css`. Variables de colores en `:root` al principio.

### Ejemplo: pizza americana

En `datos/menu.js` existe un solo producto `Americana` con cuatro variantes: `Personal`, `Mediana`, `Familiar` y `Extragrande`. Cada variante tiene su **propio precio** y su **propia ruta de imagen**. Al tocar un tamaño dentro del modal, cambia inmediatamente la imagen y el total.

### Ejemplo: chicha morada

Un solo producto, dos variantes de volumen: `½ litro` y `1 litro`. También cambian automáticamente precio e imagen.

## Funcionalidad incluida

- Menú dividido en **Cocina / Barra** y 13 subcategorías con buscador global.
- Modales de opciones (salsas, sabores, tipos de arroz y más), tamaños y cantidad.
- Ronda de alitas: exige escoger **tres** sabores; alitas normales: **uno**.
- Al añadir un producto, pregunta si quieres **Confirmar pedido** (abre carrito) o **Seguir comprando** (regresas exactamente al menú en el que estabas).
- Carrito guarda temporalmente los artículos en **localStorage** y permite sumar, restar o eliminar.
- Entrega **Delivery / Recojo / Consumo en el local**, nombre, celular, zona, dirección, referencia, mesa, método de pago y notas.
- WhatsApp precompletado al **+51 945 483 809**, con productos, tamaños, opciones, cantidades, subtotal y datos de entrega.
- Mapa integrado y botón de indicaciones hacia **Jr. Cusco 430, San Ignacio, Perú**.
- Aviso de autodeclaración de mayoría de edad al añadir bebidas alcohólicas.
- Diseño adaptable a PC y móvil, con animaciones ligeras y preferencia de movimiento reducido.

## Confirmaciones necesarias antes de publicar

- **Revisar todos los precios y la carta** con el negocio; se digitalizaron desde el DOCX adjunto.
- **Reemplazar las ilustraciones** por las fotos reales si se desea mostrar el producto exacto.
- **Comprobar la ubicación exacta de Google Maps**: el mapa usa una búsqueda textual de la dirección facilitada y podría no marcar la puerta exacta.
- **Confirmar zonas/costos de delivery**, horarios y medios de pago; no fueron proporcionados, por lo que no se inventaron.
- Si se reciben pedidos con alcohol, verificar edad de forma adecuada antes de entregar. El aviso en la web es solo una declaración del visitante.

## Probar sin publicar

Puedes abrir `index.html` directamente en tu computadora. También puedes servir la carpeta con `python -m http.server 8000` y abrir `http://localhost:8000`.

---
*Carta digital estática — Bohemios.*
