import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../styles/navbar.css";

const SESSION_KEY = "OutmodedSession";

function Navbar({ cantidadCarrito }) {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Oculta el navbar en todas las rutas administrativas
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const tieneSesionActiva = () => {
    const localSession =
      localStorage.getItem(SESSION_KEY);

    const temporarySession =
      sessionStorage.getItem(SESSION_KEY);

    return Boolean(
      localSession || temporarySession
    );
  };

  const loggedIn = tieneSesionActiva();

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header className="Outmoded-navbar">

      <Link
        to="/"
        className="navbar-logo"
      >
        Outmoded
      </Link>

      <nav className="navbar-menu">

        <Link to="/productos">
          Colección
        </Link>

        <Link to="/productos?categoria=ofertas">
          Ofertas
        </Link>

        <Link to="/SobreNosotros">
          Quienes
          <br />
          Somos
        </Link>

        <Link to="/contacto">
          Contacto
        </Link>

      </nav>

      <nav className="navbar-actions">

        <a href="#">
          Buscar
        </a>

        <Link
          to={loggedIn ? "/cuenta" : "/login"}
        >
          {loggedIn ? "Mi cuenta" : "Login"}
        </Link>

        <Link
          to="/carrito"
          className="navbar-cart"
        >
          <span>
            Carrito
          </span>

          <span className="cart-count">
            {cantidadCarrito}
          </span>
        </Link>

      </nav>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuAbierto(true)}
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside
        className={
          menuAbierto
            ? "mobile-menu active"
            : "mobile-menu"
        }
        aria-hidden={!menuAbierto}
      >

        <div className="mobile-menu-header">

          <span>
            MENU_01
          </span>

          <button
            className="menu-close"
            type="button"
            onClick={cerrarMenu}
            aria-label="Cerrar menú"
          >
            ×
          </button>

        </div>

        <nav className="mobile-menu-links">

          <Link
            to="/productos"
            onClick={cerrarMenu}
          >
            <span>02</span>
            Colección
          </Link>

          <Link
            to="/productos?categoria=ofertas"
            onClick={cerrarMenu}
          >
            <span>03</span>
            Ofertas
          </Link>

          <Link
            to="/SobreNosotros"
            onClick={cerrarMenu}
          >
            <span>04</span>
            Sobre Nosotros
          </Link>

          <Link
            to="/contacto"
            onClick={cerrarMenu}
          >
            <span>04</span>
            Contacto
          </Link>

          <div className="mobile-divider"></div>

          <a
            href="#"
            onClick={cerrarMenu}
          >
            <span>05</span>
            Buscar
          </a>

          <Link
            to={loggedIn ? "/cuenta" : "/login"}
            onClick={cerrarMenu}
          >
            <span>06</span>
            {loggedIn ? "Mi cuenta" : "Login"}
          </Link>

          <Link
            to="/carrito"
            className="mobile-cart"
            onClick={cerrarMenu}
          >
            <span>07</span>

            Carrito

            <b>
              {cantidadCarrito}
            </b>
          </Link>

        </nav>

        <div className="mobile-menu-footer">
          SYSTEM_01

          <span>
            ONLINE
          </span>
        </div>

      </aside>

    </header>
  );
}

export default Navbar;