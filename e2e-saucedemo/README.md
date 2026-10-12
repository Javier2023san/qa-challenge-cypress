# Cypress E2E — Sauce Demo (flujo de compra)

Suite de pruebas end-to-end con [Cypress](https://www.cypress.io/) para el flujo completo de
compra en [Sauce Demo](https://www.saucedemo.com/), usando el usuario `standard_user`.

## Alcance

El login queda fuera del alcance de la prueba: se usa solo como estado inicial, vía
`cy.login()` (cacheado con `cy.session()`). El test (`cypress/e2e/purchase-flow.cy.js`) cubre:

1. Selección de 3 productos del catálogo (leídos dinámicamente, no hardcodeados por nombre).
2. Agregado al carrito (validando el contador del ícono del carrito).
3. Acceso al carrito.
4. Validación de cantidad de productos, nombres, precios individuales e información mostrada
   (cantidad por ítem y descripción).
5. Inicio del checkout.
6. Carga de los datos requeridos (desde un fixture).
7. Validación del resumen (mismos productos; subtotal = suma de precios; total = subtotal +
   impuesto) y finalización de la compra.
8. Validación del mensaje final de confirmación y de que el carrito quedó vacío.

## Instalación

Requiere Node.js 18+.

```bash
npm install
```

## Configuración de variables de entorno

El usuario y el password no están escritos en los specs ni en los Page Objects: se leen de
variables de entorno de Cypress.

| Variable            | Uso                             |
|---------------------|---------------------------------|
| `standardUser`      | Usuario (`standard_user`)       |
| `standardPassword`  | Password del usuario estándar   |

### Opción 1 — archivo local `cypress.env.json`

```bash
cp cypress.env.json.example cypress.env.json
```

Completar `standardPassword` con el password de demo que muestra la propia página de login de
Sauce Demo. `cypress.env.json` está en `.gitignore`, así que nunca se versiona.

### Opción 2 — variables de entorno del sistema (CI/CD)

```bash
CYPRESS_standardUser=standard_user CYPRESS_standardPassword=<password> npm test
```

Los datos de checkout (nombre, apellido, código postal) están en
`cypress/fixtures/checkout-info.json`.

## Ejecución de tests

```bash
# Modo headless (Electron), como en CI
npm test

# Headless explícito
npm run test:headless

# Headless en Chrome
npm run test:chrome

# Modo interactivo (Cypress UI)
npm run cy:open
```

## Estructura del proyecto

```
cypress/
  e2e/
    purchase-flow.cy.js        # El flujo completo, con sus 8 puntos de validación
  pages/                       # Page Object Model
    components/
      CartItemList.js          # Lista de ítems compartida por carrito y resumen
    InventoryPage.js
    CartPage.js                # extends CartItemList
    CheckoutStepOnePage.js
    CheckoutStepTwoPage.js     # extends CartItemList
    CheckoutCompletePage.js
  support/
    commands.js                # cy.login() (con cy.session) y cy.openInventory()
    helpers.js                 # parsePrice(), sumPrices()
    e2e.js
  fixtures/
    checkout-info.json
cypress.config.js
cypress.env.json.example       # Plantilla de credenciales (cypress.env.json no se versiona)
```

## Decisiones de diseño (comentadas también en el código)

- **Page Object Model**: cada pantalla del flujo es su propia clase con métodos de acción
  (`addProductToCartByName`, `continueToOverview`, `finish`, …) y getters de elementos. Un
  cambio de UI se corrige en un solo lugar.
- **Componente compartido `CartItemList`**: el carrito y el resumen del checkout muestran la
  misma lista de ítems con el mismo markup. En vez de duplicar los getters en `CartPage` y
  `CheckoutStepTwoPage`, ambas clases lo extienden.
- **Selectores `[data-test="..."]` en todo el proyecto**: Sauce Demo expone estos atributos
  específicamente para automatización; son estables frente a cambios de estilos o clases CSS.
  No se usan selectores por clase.
- **Productos seleccionados dinámicamente**: se leen los primeros 3 productos del catálogo
  (nombre y precio reales) y el carrito y el resumen se comparan contra esa selección con una
  sola assertion `deep.equal` sobre `[{ name, price, quantity }]`.
- **Assertions con datos calculados, no solo "existe"**: el subtotal se compara contra la suma
  de los precios seleccionados, y el total contra subtotal + impuesto.
- **`cy.login()` como command con `cy.session()`**: es infraestructura de setup para llegar al
  estado "ya logueado" que pide el enunciado. `cy.session()` cachea cookies y localStorage, así
  que el login por UI se ejecuta una sola vez aunque la suite crezca.
- **Visita directa a `/inventory.html` con `failOnStatusCode: false`**: Sauce Demo está
  publicado como SPA en GitHub Pages; el servidor responde `404` en `/inventory.html` y esa
  página redirige a la app, que resuelve la ruta del lado del cliente. Por eso
  `cy.openInventory()` desactiva el chequeo de status y valida que la URL y el catálogo
  efectivamente carguen.
- **Datos en fixtures, lógica en helpers**: los datos del comprador están en un fixture; la
  conversión de precios (`"$29.99"` → `29.99`) está en `helpers.js` y se reutiliza.
