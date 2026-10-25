import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">

          <p className="hero-brand">
            Outmoded
          </p>

          <h1 className="hero-title">
            <span>
              NO SOMOS
            </span>

            <span>
              DEL FUTURO.
            </span>

            <span className="neon-text">
              SOMOS OUTMODED.
            </span>
          </h1>

          <p className="hero-description">
            Ropa seleccionada de otra era.
            Estética dosmilera.
            Tendencias del pasado.
          </p>


        </div>
      </section>
    </main>
  );
}

export default Home;