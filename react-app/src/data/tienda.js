import productosIniciales from "./productos.json";

export const PRODUCTOS_KEY = "OutmodedProductos";
export const ORDERS_KEY = "OutmodedOrders";

export function leerProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(PRODUCTOS_KEY) || "null");
    if (!Array.isArray(guardados)) return productosIniciales;
    // Filtra productos obsoletos o duplicados de versiones anteriores (ej: ofertas manuales antiguas)
    const limpiados = guardados.filter((p) => p.codigo !== "OFFER_009" && p.codigo !== "OFFER_010");
    const codigosGuardados = new Set(limpiados.map((p) => p.codigo));
    const productosNuevos = productosIniciales.filter((p) => !codigosGuardados.has(p.codigo));
    return [...limpiados, ...productosNuevos];
  } catch {
    return productosIniciales;
  }
}

export function guardarProductos(productos) {
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
}

export function existeCodigoProducto(productos, codigo, excluirId = null) {
  if (!codigo || !Array.isArray(productos)) return false;
  const normalizado = String(codigo).trim().toUpperCase();
  return productos.some(
    (p) => p.id !== excluirId && String(p.codigo || "").trim().toUpperCase() === normalizado
  );
}

export function crearProducto(productos, producto) {
  if (producto.codigo && existeCodigoProducto(productos, producto.codigo)) {
    return productos;
  }
  const nuevo = { ...producto, id: producto.id ?? Date.now() };
  return [...productos, nuevo];
}

export function actualizarProducto(productos, id, cambios) {
  return productos.map((producto) =>
    producto.id === id ? { ...producto, ...cambios } : producto
  );
}

export function eliminarProducto(productos, id) {
  return productos.filter((producto) => producto.id !== id);
}

export function restablecerProductos() {
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productosIniciales));
  return productosIniciales;
}

export function descargarProductosJSON(productos) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(productos, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "productos.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function leerOrdenes() {
  try {
    const ordenes = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(ordenes) ? ordenes : [];
  } catch {
    return [];
  }
}

export function guardarOrdenes(ordenes) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(ordenes));
}
