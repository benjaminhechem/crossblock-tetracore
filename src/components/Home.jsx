import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-screen">
      <h1>CrossBlock (TetraCore)</h1>
      <p className="subtitle">Videojuego de puzzle y acción periférica</p>

      <div className="card-info">
        <h3>Reglas Básicas</h3>
        <ul>
          <li>4 cañones disparan bloques hacia el núcleo central.</li>
          <li>Combina colores para despejar el tablero y sumar puntos.</li>
        </ul>
      </div>

      <Link to="/juego" className="btn-play">
        ¡INICIAR JUEGO!
      </Link>
    </div>
  );
}