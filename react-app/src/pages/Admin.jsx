import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { crearProducto, actualizarProducto, eliminarProducto, leerOrdenes, guardarOrdenes, ORDERS_KEY } from "../data/tienda";
import { tieneOferta, calcularDescuento } from "../utils/precios";
import "../styles/admin.css";

const money = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;
const initialForm = { codigo: "", nombre: "", categoria: "tops", categoriaLabel: "Tops", precio: "", precioOferta: "", stock: "", imagen: "/img/camisetaBabyTeeNegraStatic.png", descripcion: "" };

function crearPedidosDemo(productos) {
  const porId = (id) => productos.find((p) => p.id === id) || productos[0];
  const muestras = [
    { meses: 5, cliente: "Camila Rojas", correo: "camila.demo@gmail.com", items: [[1, 3], [4, 1]] },
    { meses: 4, cliente: "Matías Soto", correo: "matias.demo@gmail.com", items: [[3, 2], [5, 1]] },
    { meses: 3, cliente: "Antonia Díaz", correo: "antonia.demo@gmail.com", items: [[2, 4]] },
    { meses: 2, cliente: "Lucas Pérez", correo: "lucas.demo@gmail.com", items: [[7, 1], [8, 1]] },
    { meses: 1, cliente: "Fernanda Silva", correo: "fernanda.demo@gmail.com", items: [[9, 3], [10, 2]] },
    { meses: 0, cliente: "Javiera Muñoz", correo: "javiera.demo@gmail.com", items: [[1, 2], [9, 1]] },
    { meses: 2, cliente: "Tomás Reyes", correo: "tomas.demo@gmail.com", items: [[4, 3], [6, 2]] },
    { meses: 0, cliente: "Valentina León", correo: "valentina.demo@gmail.com", items: [[10, 2], [3, 1]] }
  ];
  return muestras.map((m, index) => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - m.meses);
    fecha.setDate(Math.min(25, 2 + index * 3));
    const lineas = m.items.map(([id, cantidad]) => {
      const producto = porId(id);
      return { ...producto, cantidad };
    });
    const subtotal = lineas.reduce((sum, p) => sum + (p.precioOferta && p.precioOferta < p.precio ? p.precioOferta : p.precio) * p.cantidad, 0);
    return {
      id: `DEMO-${String(index + 1).padStart(3, "0")}`,
      fecha: fecha.toISOString(),
      cuentaEmail: m.correo,
      cliente: { nombre: m.cliente, correo: m.correo, telefono: "900000000", region: "Metropolitana de Santiago", comuna: "Santiago", direccion: "Dirección de demostración" },
      metodoPago: "DEMO",
      productos: lineas,
      subtotal,
      envio: 3990,
      total: subtotal + 3990,
      estado: index % 3 === 0 ? "PENDIENTE" : index % 3 === 1 ? "CONFIRMADO" : "PAGADA",
      demo: true
    };
  });
}

function cargarOrdenesIniciales(productos) {
  const yaExiste = localStorage.getItem(ORDERS_KEY);
  if (yaExiste !== null) return leerOrdenes();
  const demo = crearPedidosDemo(productos);
  guardarOrdenes(demo);
  return demo;
}

function Admin({ productos, setProductos }) {
  const location = useLocation();
  const [ordenes, setOrdenes] = useState(() => cargarOrdenesIniciales(productos));
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoStockId, setEditandoStockId] = useState(null);
  const [loteStock, setLoteStock] = useState("");
  const [editandoOfertaId, setEditandoOfertaId] = useState(null);
  const [nuevoPrecioOferta, setNuevoPrecioOferta] = useState("");

  const rawSeccion = location.pathname.replace("/admin", "") || "/";
  // Si navegan a /stock se atiende directamente en inventario
  const seccion = rawSeccion === "/stock" ? "/inventario" : rawSeccion;

  const ventas = useMemo(() => {
    const map = {};
    ordenes.forEach((orden) => (orden.productos || []).forEach((p) => {
      map[p.nombre] = (map[p.nombre] || 0) + Number(p.cantidad || 0);
    }));
    return Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [ordenes]);
  const ventasTotales = ordenes.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pedidosPendientes = ordenes.filter((o) => o.estado === "PAGADA" || o.estado === "PENDIENTE").length;
  const maxVentas = Math.max(1, ...ventas.map((v) => v[1]));

  const guardar = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || Number(form.precio) <= 0 || Number(form.stock) < 0) {
      setMensaje("Completa el nombre, un precio mayor a cero y un stock válido.");
      return;
    }
    if (form.precioOferta) {
      const pOferta = Number(form.precioOferta);
      if (pOferta <= 0 || pOferta >= Number(form.precio)) {
        setMensaje("El precio de oferta debe ser mayor a cero y menor que el precio normal.");
        return;
      }
    }
    const nuevo = {
      ...form,
      id: Date.now(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      precioOferta: form.precioOferta ? Number(form.precioOferta) : null
    };
    setProductos((actuales) => crearProducto(actuales, nuevo));
    setForm(initialForm);
    setMostrarForm(false);
    setMensaje("Producto agregado correctamente.");
  };

  const ajustarStockDelta = (id, delta) => {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    const nuevo = Math.max(0, (prod.stock || 0) + delta);
    setProductos((actuales) => actualizarProducto(actuales, id, { stock: nuevo }));
    setMensaje(`Stock de "${prod.nombre}" actualizado a ${nuevo}.`);
  };

  const aplicarLoteStock = (e, id) => {
    e.preventDefault();
    const cantidad = Number(loteStock);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMensaje("Ingresa una cantidad entera mayor que cero.");
      return;
    }
    const prod = productos.find((p) => p.id === id);
    const nuevo = (prod?.stock || 0) + cantidad;
    setProductos((actuales) => actualizarProducto(actuales, id, { stock: nuevo }));
    setEditandoStockId(null);
    setLoteStock("");
    setMensaje(`Se sumaron ${cantidad} unidades a "${prod?.nombre}". Nuevo stock: ${nuevo}.`);
  };

  const iniciarEdicionOferta = (prod) => {
    setEditandoOfertaId(prod.id);
    setNuevoPrecioOferta(prod.precioOferta ? String(prod.precioOferta) : "");
  };

  const guardarOferta = (e, id) => {
    e.preventDefault();
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    const oferta = Number(nuevoPrecioOferta);
    if (!oferta || oferta <= 0) {
      setMensaje("Ingresa un precio de oferta válido mayor a cero.");
      return;
    }
    if (oferta >= prod.precio) {
      setMensaje(`El precio de oferta (${money(oferta)}) debe ser menor que el precio normal (${money(prod.precio)}).`);
      return;
    }
    setProductos((actuales) => actualizarProducto(actuales, id, { precioOferta: oferta }));
    setEditandoOfertaId(null);
    setNuevoPrecioOferta("");
    setMensaje(`Oferta de ${money(oferta)} aplicada a "${prod.nombre}". Ahora es visible en la tienda.`);
  };

  const quitarOferta = (id) => {
    const prod = productos.find((p) => p.id === id);
    setProductos((actuales) => actualizarProducto(actuales, id, { precioOferta: null }));
    setMensaje(`Oferta eliminada de "${prod?.nombre}". Volvió a precio normal.`);
  };

  const cambiarEstado = (id, estado) => {
    const actualizadas = ordenes.map((o) => o.id === id ? { ...o, estado } : o);
    setOrdenes(actualizadas);
    guardarOrdenes(actualizadas);
    setMensaje(`Pedido ${id}: ${estado.toLowerCase()}.`);
  };
  const productosFiltrados = productos.filter((p) => `${p.nombre} ${p.codigo}`.toLowerCase().includes(busqueda.toLowerCase()));

  return <main className="admin-page container-fluid py-4 px-3 px-md-5">
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
      <div><p className="admin-eyebrow mb-2">Outmoded / CONTROL</p><h1 className="admin-title mb-1">PANEL ADMINISTRATIVO.</h1><p className="text-secondary mb-0">Gestión local de inventario, pedidos y estadísticas de la tienda.</p><span className="badge text-bg-warning mt-2">Incluye pedidos ficticios de demostración</span></div>
      <Link className="btn btn-outline-dark" to="/">Volver a la tienda ↗</Link>
    </div>
    <nav className="admin-nav nav nav-pills flex-wrap gap-2 mb-4">
      <Link className={`nav-link ${seccion === "/" ? "active" : ""}`} to="/admin">Dashboard</Link>
      <Link className={`nav-link ${seccion === "/inventario" ? "active" : ""}`} to="/admin/inventario">Inventario y Stock</Link>
      <Link className={`nav-link ${seccion === "/pedidos" ? "active" : ""}`} to="/admin/pedidos">Confirmar pedidos</Link>
      <Link className={`nav-link ${seccion === "/cuenta" ? "active" : ""}`} to="/admin/cuenta">Cuenta/ajustes</Link>
    </nav>
    {mensaje && <div className="alert alert-info alert-dismissible" role="status">{mensaje}<button className="btn-close" aria-label="Cerrar" onClick={() => setMensaje("")}/></div>}

    {seccion === "/" && <>
      <div className="row g-3 mb-4">
        {[["Productos registrados", productos.length], ["Pedidos registrados", ordenes.length], ["Pedidos por preparar", pedidosPendientes], ["Ventas simuladas", money(ventasTotales)]].map(([label, value]) => <div className="col-12 col-sm-6 col-xl-3" key={label}><div className="admin-stat h-100"><span>{label}</span><strong>{value}</strong></div></div>)}
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-7"><section className="admin-panel h-100"><div className="d-flex justify-content-between align-items-center mb-3"><h2>Productos más vendidos</h2><span className="badge text-bg-secondary">Por unidades</span></div>
          {ventas.length ? ventas.map(([nombre, cantidad]) => <div className="chart-row" key={nombre}><div className="d-flex justify-content-between gap-3"><span>{nombre}</span><strong>{cantidad}</strong></div><div className="progress mt-2"><div className="progress-bar" role="progressbar" style={{ width: `${cantidad / maxVentas * 100}%` }} aria-valuenow={cantidad} aria-valuemin="0" aria-valuemax={maxVentas}/></div></div>) : <p className="text-secondary">Todavía no hay ventas registradas. El gráfico se actualizará al realizar compras de prueba.</p>}
        </section></div>
        <div className="col-12 col-lg-5"><section className="admin-panel h-100"><h2>Temporadas de compra</h2><p className="text-secondary small">Conteo de pedidos por mes de compra.</p>
          {Object.entries(ordenes.reduce((acc, o) => { const d = new Date(o.fecha); const mes = Number.isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleDateString("es-CL", { month: "long", year: "numeric" }); acc[mes] = (acc[mes] || 0) + 1; return acc; }, {})).map(([mes, cantidad]) => <div className="d-flex justify-content-between border-bottom py-2" key={mes}><span className="text-capitalize">{mes}</span><strong>{cantidad} pedido(s)</strong></div>)}
          {!ordenes.length && <p className="text-secondary">Aún no hay datos suficientes para identificar temporadas.</p>}
        </section></div>
      </div>
      <div className="admin-shortcuts mt-4"><Link to="/admin/inventario">＋ Administrar inventario y stock</Link><Link to="/admin/pedidos">✓ Revisar pedidos</Link></div>
    </>}

    {seccion === "/inventario" && <section className="admin-panel">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h2 className="mb-1">Inventario y Stock</h2>
          <p className="text-secondary small mb-0">Gestiona catálogo y ajusta el stock de cada producto directamente desde la tabla.</p>
        </div>
        <button
          type="button"
          className={`btn ${mostrarForm ? "btn-outline-dark" : "btn-dark"} d-inline-flex align-items-center gap-1`}
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "✕ Cerrar formulario" : "＋ Agregar nuevo producto"}
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <input className="form-control" placeholder="Buscar por nombre o código" value={busqueda} onChange={e => setBusqueda(e.target.value)} aria-label="Buscar producto"/>
        </div>
      </div>

      {mostrarForm && (
        <form className="row g-2 border rounded p-3 mb-4 bg-light" onSubmit={guardar}>
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h3 className="h5 mb-0">Nuevo Producto</h3>
            <span className="badge text-bg-secondary">Formulario de registro</span>
          </div>
          <div className="col-12 col-md-3"><label className="form-label">Código</label><input className="form-control" value={form.codigo} onChange={e => setForm({...form,codigo:e.target.value})} required/></div>
          <div className="col-12 col-md-5"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} required/></div>
          <div className="col-6 col-md-2"><label className="form-label">Precio CLP</label><input className="form-control" type="number" min="1" value={form.precio} onChange={e => setForm({...form,precio:e.target.value})} required/></div>
          <div className="col-6 col-md-2"><label className="form-label">Precio Oferta (opcional)</label><input className="form-control" type="number" min="1" placeholder="Ej: 14990" value={form.precioOferta || ""} onChange={e => setForm({...form,precioOferta:e.target.value})}/></div>
          <div className="col-6 col-md-2"><label className="form-label">Stock inicial</label><input className="form-control" type="number" min="0" value={form.stock} onChange={e => setForm({...form,stock:e.target.value})} required/></div>
          <div className="col-6 col-md-3"><label className="form-label">Categoría</label><select className="form-select" value={form.categoria} onChange={e => {const categoria=e.target.value; setForm({...form,categoria,categoriaLabel:categoria[0].toUpperCase()+categoria.slice(1)});}}><option value="tops">Tops</option><option value="bottoms">Bottoms</option><option value="accesorios">Accesorios</option><option value="outerwear">Outerwear</option><option value="ofertas">Ofertas</option></select></div>
          <div className="col-12 col-md-7"><label className="form-label">Descripción</label><input className="form-control" value={form.descripcion} onChange={e => setForm({...form,descripcion:e.target.value})}/></div>
          <div className="col-12 d-flex gap-2 mt-2">
            <button className="btn btn-dark" type="submit">Guardar producto</button>
            <button className="btn btn-outline-secondary" type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th style={{ minWidth: "190px" }}>Precio / Oferta</th>
              <th style={{ minWidth: "220px" }}>Ajuste de Stock</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.id}>
                <td><code>{p.codigo}</code></td>
                <td>
                  <strong>{p.nombre}</strong>
                  <div className="text-secondary small">{p.categoriaLabel}</div>
                </td>
                <td>
                  <div className="py-1">
                    <span className={tieneOferta(p) ? "text-decoration-line-through text-secondary small d-block mb-1" : "fw-bold d-block mb-2"}>
                      {money(p.precio)}
                    </span>

                    {tieneOferta(p) && (
                      <div className="d-flex align-items-center gap-1 mb-2">
                        <span className="badge text-bg-danger fw-normal" style={{ fontSize: "0.75rem" }}>
                          {money(p.precioOferta)} (-{calcularDescuento(p)}%)
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0 ms-1 text-decoration-none"
                          style={{ fontSize: "0.75rem" }}
                          title="Quitar oferta"
                          onClick={() => quitarOferta(p.id)}
                        >
                          ✕ Quitar
                        </button>
                      </div>
                    )}

                    {editandoOfertaId === p.id ? (
                      <form className="d-flex align-items-center gap-1 mt-2" onSubmit={(e) => guardarOferta(e, p.id)}>
                        <input
                          type="number"
                          className="form-control form-control-sm py-0 px-2"
                          style={{ width: "90px", height: "28px" }}
                          placeholder="Oferta $"
                          min="1"
                          max={p.precio - 1}
                          autoFocus
                          value={nuevoPrecioOferta}
                          onChange={(e) => setNuevoPrecioOferta(e.target.value)}
                        />
                        <button type="submit" className="btn btn-sm btn-dark py-0 px-2" style={{ height: "28px" }} title="Aplicar oferta">✓</button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-1"
                          style={{ height: "28px" }}
                          onClick={() => { setEditandoOfertaId(null); setNuevoPrecioOferta(""); }}
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary py-1 px-2 d-inline-block"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => iniciarEdicionOferta(p)}
                      >
                        {tieneOferta(p) ? "✎ Modificar oferta" : "＋ Aplicar oferta"}
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Ajustar stock">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-2"
                        title="Reducir stock en 1"
                        disabled={p.stock <= 0}
                        onClick={() => ajustarStockDelta(p.id, -1)}
                      >
                        −
                      </button>
                      <span
                        className={`badge ${p.stock <= 3 ? "text-bg-danger" : "text-bg-success"} rounded-0 d-flex align-items-center justify-content-center px-3 border-0`}
                        style={{ minWidth: "56px", fontSize: "0.82rem", fontWeight: "600" }}
                      >
                        {p.stock} un.
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-2"
                        title="Aumentar stock en 1"
                        onClick={() => ajustarStockDelta(p.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    {editandoStockId === p.id ? (
                      <form className="d-inline-flex align-items-center gap-1" onSubmit={(e) => aplicarLoteStock(e, p.id)}>
                        <input
                          type="number"
                          className="form-control form-control-sm py-0 px-1"
                          style={{ width: "65px", height: "28px" }}
                          placeholder="+cant"
                          min="1"
                          autoFocus
                          value={loteStock}
                          onChange={(e) => setLoteStock(e.target.value)}
                        />
                        <button type="submit" className="btn btn-sm btn-dark py-0 px-2" style={{ height: "28px" }} title="Guardar">✓</button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-1"
                          style={{ height: "28px" }}
                          onClick={() => { setEditandoStockId(null); setLoteStock(""); }}
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark py-0 px-2"
                        style={{ fontSize: "0.75rem", height: "28px" }}
                        title="Ingresar lote de unidades"
                        onClick={() => { setEditandoStockId(p.id); setLoteStock(""); }}
                      >
                        + Lote
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setProductos(actuales => eliminarProducto(actuales, p.id));
                      setMensaje("Producto eliminado del catálogo.");
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>}

    {seccion === "/pedidos" && <section className="admin-panel"><h2>Confirmación y preparación de pedidos</h2>{ordenes.length ? <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{ordenes.map(o => <tr key={o.id}><td>{o.id}{o.demo && <><br/><span className="badge text-bg-warning">DEMO</span></>}</td><td>{o.cliente?.nombre}<br/><small>{o.cliente?.correo}</small></td><td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td><td>{money(o.total)}</td><td><span className="badge text-bg-secondary">{o.estado}</span></td><td><div className="d-flex flex-wrap gap-1"><button className="btn btn-sm btn-outline-primary" onClick={() => cambiarEstado(o.id,"CONFIRMADO")}>Aceptar</button><button className="btn btn-sm btn-outline-success" onClick={() => cambiarEstado(o.id,"PREPARADO")}>Preparado</button><button className="btn btn-sm btn-outline-danger" onClick={() => cambiarEstado(o.id,"CANCELADO")}>Cancelar</button></div></td></tr>)}</tbody></table></div> : <p className="text-secondary">No hay pedidos registrados todavía. Realiza una compra de prueba para verla aquí.</p>}</section>}

    {seccion === "/cuenta" && <section className="admin-panel"><h2>Cuenta y ajustes</h2><p>Esta versión corresponde a una demostración frontend Outmoded. Los cambios se guardan en el almacenamiento local de este navegador.</p><p><strong>Productos:</strong> {productos.length} registrados</p><p><strong>Pedidos:</strong> {ordenes.length} registrados</p><button className="btn btn-outline-danger" onClick={() => { if (window.confirm("¿Borrar el historial local de pedidos?")) {setOrdenes([]); guardarOrdenes([]); setMensaje("Historial local eliminado.");} }}>Limpiar historial de pedidos</button></section>}
  </main>;
}
export default Admin;
