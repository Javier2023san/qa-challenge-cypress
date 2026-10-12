# Cypress API Testing — Fake Store API

Suite de pruebas automatizadas para [Fake Store API](https://fakestoreapi.com/) (documentación
oficial: https://fakestoreapi.com/docs), construida con [Cypress](https://www.cypress.io/).

## Alcance

- **Login y manejo de token** (`cypress/e2e/api/auth.cy.js`): login con credenciales válidas,
  captura y reutilización del token, y dos escenarios negativos (password inválida, usuario
  inexistente).
- **Carrito de compras** (`cypress/e2e/api/cart.cy.js`): creación con productos obtenidos
  dinámicamente desde `GET /products`, actualización agregando un producto adicional, y
  eliminación del carrito. Los tres pasos comparten el mismo `cartId`, generado por el primer
  test, tal como lo pide el enunciado ("utilizar el carrito creado previamente"). Se suma un
  test de eliminación sobre un carrito pre-cargado de la API para validar la estructura completa
  de la respuesta del `DELETE` (ver "Decisiones de diseño").

Todas las pruebas validan: código de estado HTTP, `content-type` de la respuesta, y la
estructura/tipos de datos del body (ver `cypress/support/schemas.js`).

## Instalación

Requiere Node.js 18+.

```bash
npm install
```

## Configuración de variables de entorno

Ninguna credencial ni token está escrito dentro de los archivos de test. Se leen en tiempo de
ejecución desde variables de entorno de Cypress:

| Variable              | Uso                                                |
|-----------------------|----------------------------------------------------|
| `apiUsername`         | Usuario para el login válido                       |
| `apiPassword`         | Password para el login válido                      |
| `apiUsernameInvalid`  | Usuario para el escenario negativo                 |
| `apiPasswordInvalid`  | Password (incorrecta a propósito) para el negativo |

### Opción 1 — archivo local `cypress.env.json` (recomendada para correr en local)

Copiar el archivo de ejemplo y completar los valores:

```bash
cp cypress.env.json.example cypress.env.json
```

Las credenciales de prueba son las publicadas en la documentación de Fake Store API
(sección *Login*). `cypress.env.json` está en `.gitignore`, así que nunca se versiona.

### Opción 2 — variables de entorno del sistema (CI/CD)

Cypress lee automáticamente cualquier variable con prefijo `CYPRESS_`:

```bash
CYPRESS_apiUsername=<usuario> CYPRESS_apiPassword=<password> CYPRESS_apiPasswordInvalid=<password-incorrecta> npm test
```

### Token

El token obtenido en el login se guarda en memoria vía `Cypress.env('authToken')` dentro del
comando `cy.apiLogin()` (`cypress/support/commands.js`) y se reutiliza en los requests de
carrito con la función `authHeaders()` (`cypress/support/helpers.js`), que arma el header
`Authorization: Bearer <token>`. El token tampoco se hardcodea en ningún spec.

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
  e2e/api/
    auth.cy.js          # Login: positivo + negativos
    cart.cy.js          # Creación / actualización / eliminación de carrito
  support/
    commands.js         # Custom commands: cy.apiLogin(), cy.getProducts()
    helpers.js          # Funciones planas: authHeaders(), pickRandomProducts()
    schemas.js          # Validación de estructura/tipos (product, cart)
    e2e.js              # Carga de commands.js
cypress.config.js
cypress.env.json.example  # Plantilla de credenciales (cypress.env.json no se versiona)
```

## Decisiones de diseño (comentadas también en el código)

- **Por qué `cy.request()` y no una librería HTTP aparte**: es el cliente HTTP nativo de
  Cypress, corre fuera del navegador (más rápido, sin necesidad de una página cargada) y expone
  `status`, `headers` y `body` listos para assertions con Chai.
- **Commands vs. helpers**: lo que encola requests de Cypress (`apiLogin`, `getProducts`) es un
  custom command; lo que es lógica pura y síncrona (`authHeaders`, `pickRandomProducts`) es una
  función plana en `helpers.js`. `authHeaders()` no puede ser un command porque debe devolver un
  objeto usable dentro de `cy.request({ headers })`, no un chainable.
- **Por qué no se usa un JSON-schema validator (ajv, chai-json-schema)**: los dos shapes a
  validar (`product`, `cart`) son pequeños y estables; se optó por helpers propios en
  `schemas.js` con assertions explícitas de tipo por campo, evitando una dependencia extra.
- **Por qué `cart.cy.js` encadena create → update → delete en un mismo describe**: el enunciado
  pide reutilizar el carrito creado; en vez de tres specs independientes que tendrían que crear
  su propio carrito cada uno, se comparte el `cartId` a través de una variable del `describe`.
- **Catálogo pedido una sola vez**: `cy.getProducts()` se ejecuta en el `before()` y el
  resultado se reutiliza tanto para crear el carrito como para elegir el producto adicional de
  la actualización, evitando requests repetidos.
- **Productos dinámicos**: `pickRandomProducts()` elige ids reales del catálogo al azar (y puede
  excluir los ya usados), para no depender de ids fijos. Los ids elegidos se loguean con
  `cy.log()` para poder reproducir un fallo.
- **Por qué el login negativo verifica texto plano y no JSON**: Fake Store API responde `401`
  con `content-type: text/html` en credenciales inválidas, a diferencia del login exitoso que sí
  devuelve JSON. El test refleja ese comportamiento real.
- **Códigos de estado verificados contra la API real, no asumidos**: `POST /auth/login` y
  `POST /carts` responden `201 Created` (no `200`); `GET`, `PUT` y `DELETE` responden `200`.
- **`DELETE` del carrito creado devuelve `null`**: Fake Store API es un mock — los `POST` no
  persisten datos nuevos. Al borrar el carrito creado en la misma corrida, la API responde `200`
  con body `null`. Por eso se agregó un segundo test que borra un carrito pre-cargado (id
  obtenido dinámicamente de `GET /carts`), donde la API sí devuelve el carrito eliminado y se
  puede validar su estructura completa.
- **Credenciales fuera del repositorio**: `cypress.env.json` está en `.gitignore`; solo se
  versiona la plantilla `cypress.env.json.example`.
