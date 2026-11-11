import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './components/home';
import Game from './components/game';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="nav-bar">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/juego" className="nav-link">Juego</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/juego" element={<Game />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}