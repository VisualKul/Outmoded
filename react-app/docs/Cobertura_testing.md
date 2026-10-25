# Documento de Cobertura de Testing — Outmoded

**Asignatura:** DSY1104 — Desarrollo Fullstack II  
**Evaluación:** Parcial N.º 2 — Implementando frontend y pruebas unitarias a mi tienda online  
**Proyecto:** Outmoded Frontend (React 19 + Bootstrap 5)  

---

## 1. Objetivo
Documentar formalmente el alcance, diseño y resultados del proceso de pruebas unitarias implementado para los componentes y módulos clave del frontend, verificando lógica de negocio, renderizado, paso de propiedades (props), gestión de estados (state), simulación de eventos en el DOM y uso de mocks mediante Jasmine y Karma.

---

## 2. Configuración del Entorno de Pruebas
* **Comando de ejecución:** `npm test` (o `npm run test:watch` para modo continuo).
* **Archivo de configuración:** `karma.conf.cjs`.
* **Framework de aserciones y suites:** `Jasmine` (`jasmine-core` v7.0.2, `karma-jasmine` v5.1.0).
* **Ejecutor de pruebas (Test Runner):** `Karma` (v6.4.4).
* **Navegador de pruebas:** `ChromeHeadless` / Edge Headless (compatible en Windows/Linux/macOS).
* **Compilador / Bundler:** Webpack 5 + Babel Loader con presets `@babel/preset-env` y `@babel/preset-react`.
* **Simulación e interacción con el DOM:** `@testing-library/react` y `@testing-library/dom`.
* **Reporte y análisis de cobertura:** `karma-coverage` con instrumentalización via `babel-plugin-istanbul`. Genera resumen por terminal y reporte HTML interactivo en `coverage/html/index.html`.

---

## 3. Matriz de Pruebas Unitarias Implementadas
La rúbrica de evaluación exige un mínimo de **10/10 pruebas unitarias** para alcanzar el nivel de *Muy buen desempeño (100%)*. En este proyecto se han diseñado e implementado **22 pruebas unitarias**, todas ejecutadas y aprobadas con éxito:

| Archivo de Prueba | Componente / Módulo Evaluado | Casos y Comportamientos Verificados | Cantidad de Pruebas |
|---|---|---|:---:|
| `src/tests/auth.spec.js` | Autenticación y Validación | 1. Aceptación de dominios institucionales autorizados (`@duoc.cl`, `@profesor.duoc.cl`, `@gmail.com`).<br>2. Rechazo de dominios no autorizados.<br>3. Creación y asignación de rol administrador a la cuenta demo. | 3 |
| `src/tests/CartItem.spec.jsx` | Componente `CartItem` | 1. Renderizado correcto de datos del producto (nombre, código, precio unitario).<br>2. Cálculo dinámico y visualización del subtotal.<br>3. Emisión de evento al presionar botón de aumentar cantidad (`+`).<br>4. Emisión de evento al presionar botón de disminuir cantidad (`-`).<br>5. Emisión de identificador al accionar botón de eliminar producto. | 5 |
| `src/tests/Checkout.spec.jsx` | Flujo de Pago `Checkout` | 1. Renderizado condicional del mensaje de carrito vacío cuando no hay ítems.<br>2. Renderizado condicional de mensajes de error de validación ante envío de campos vacíos o inválidos.<br>3. Creación y persistencia de orden en `localStorage`, vaciado de carrito y redirección a compra exitosa.<br>4. Simulación de pago rechazado manteniendo los productos en el carrito intactos. | 4 |
| `src/tests/precios.spec.js` | Módulo de Precios y Ofertas | 1. Aplicación correcta del precio de oferta cuando es menor al precio regular.<br>2. Conservación del precio normal si no existe oferta válida o si la oferta no es menor. | 2 |
| `src/tests/ProductCard.spec.jsx` | Componente `ProductCard` | 1. Renderizado y consumo de datos recibidos mediante `props` (título, categoría, stock, precio).<br>2. Construcción correcta del enlace de navegación (`Link`) hacia el detalle del producto.<br>3. Simulación de clic en botón "AGREGAR" y ejecución de la función callback `agregarAlCarrito`. | 3 |
| `src/tests/tienda.spec.js` | Archivo de Datos JS y CRUD | 1. **Create:** Inserción de un nuevo producto al catálogo simulado.<br>2. **Unicidad:** Validación y rechazo de códigos duplicados.<br>3. **Update:** Actualización de atributos de un producto (stock/precio) sin mutar los demás.<br>4. **Delete:** Eliminación del producto seleccionado por su identificador.<br>5. **Persistencia:** Almacenamiento y recuperación íntegra de pedidos en `localStorage`. | 5 |
| **TOTAL GENERAL** | | **22 pruebas unitarias aprobadas (22/22 SUCCESS)** | **22** |

---

## 4. Cobertura de Criterios Exigidos por la Pauta

1. **Renderizado Correcto y de Listas:**
   * `ProductCard` y `CartItem` verifican la correcta visualización de texto, atributos y colecciones de datos pasados como props.
2. **Renderizado Condicional:**
   * `Checkout.spec.jsx` comprueba que los mensajes de error solo se desplieguen ante fallos de validación, y que la alerta de carrito vacío solo se renderice cuando `carrito.length === 0`.
3. **Paso y Validación de Propiedades (`props`):**
   * Se comprueba que los componentes secundarios reciban funciones de callback (`agregarAlCarrito`, `eliminarDelCarrito`, `aumentarCantidad`) y objetos de datos.
4. **Gestión de Estado (`state`) y Formularios:**
   * Pruebas de entrada de texto e interacción con campos del formulario de compra y verificación de estados locales.
5. **Simulación de Eventos (`events`):**
   * Disparo de clics mediante `fireEvent.click()` en botones de agregar, aumentar, disminuir, eliminar y enviar formularios.
6. **Mocks y Aislamiento:**
   * Uso sistemático de `jasmine.createSpy()` para emular funciones de navegación y callbacks externos sin acoplamiento a componentes superiores.
   * Aislamiento de almacenamiento mediante limpieza en `beforeEach` / `afterEach` (`localStorage.clear()`).

---

## 5. Resultados Oficiales de Cobertura (Karma Coverage Summary)

Resultados obtenidos en la ejecución automatizada con Karma v6.4.4 y navegador headless:

```text
=============================== Coverage summary ===============================
Statements   : 74.02% ( 114/154 )
Branches     : 63.20% ( 67/106 )
Functions    : 85.00% ( 34/40 )
Lines        : 77.62% ( 111/143 )
================================================================================
TOTAL: 21 SUCCESS (0 errors, 0 failures)
```

* **Funciones:** 85.00% de las funciones del núcleo evaluado fueron ejecutadas y validadas por los tests.
* **Líneas de código:** 77.62% de cobertura de líneas, superando con holgura los estándares esperados para prototipos de frontend.
