# QA Challenge — Cypress

Entrega de los dos ejercicios de automatización con [Cypress](https://www.cypress.io/).

| Carpeta | Ejercicio |
|---|---|
| [`api-fakestore/`](api-fakestore) | 1. API Testing — [Fake Store API](https://fakestoreapi.com/) |
| [`e2e-saucedemo/`](e2e-saucedemo) | 2. Automatización E2E UI — [Sauce Demo](https://www.saucedemo.com/) |

Cada carpeta es un proyecto Cypress independiente, con su propio `package.json` y su propio
README con el detalle de instalación, variables de entorno, ejecución y decisiones de diseño.

## Ejecución rápida

Requiere Node.js 18+.

```bash
# 1. API
cd api-fakestore
npm install
cp cypress.env.json.example cypress.env.json   # completar credenciales (ver README)
npm test

# 2. E2E
cd ../e2e-saucedemo
npm install
cp cypress.env.json.example cypress.env.json   # completar credenciales (ver README)
npm test
```
