import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        color: '#e2e8f0',
        minHeight: 'calc(100vh - 110px)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      {/* Título Principal */}
      <div>
        <div
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.85rem',
            letterSpacing: '4px',
            color: '#ff0055',
            marginBottom: '6px',
            textShadow: '0 0 10px rgba(255, 0, 85, 0.6)',
          }}
        >
          ✦ SISTEMA ARCADE 7x7 ✦
        </div>
        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '3rem',
            fontWeight: '900',
            color: '#00f3ff',
            letterSpacing: '6px',
            margin: 0,
            textShadow: '0 0 20px rgba(0, 243, 255, 0.75), 0 0 40px rgba(157, 0, 255, 0.4)',
          }}
        >
          TETRACORE
        </h1>
      </div>

      {/* Tarjeta Glassmorphic: Reglas Básicas */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '24px 28px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 243, 255, 0.35)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), inset 0 0 14px rgba(0, 243, 255, 0.1)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <h3
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.95rem',
            color: '#fbbf24',
            letterSpacing: '2px',
            textAlign: 'center',
            marginBottom: '16px',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
            textShadow: '0 0 10px rgba(251, 191, 36, 0.45)',
          }}
        >
          REGLAS BÁSICAS
        </h3>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1.08rem',
            lineHeight: '1.4',
            color: '#cbd5e1',
          }}
        >
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>▸</span>
            <span>4 cañones disparan bloques hacia el núcleo central.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#00ff66', fontWeight: 'bold' }}>▸</span>
            <span>Combina 3 o más colores contiguos para despejar el tablero y sumar puntos.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#ff0055', fontWeight: 'bold' }}>▸</span>
            <span>Usa las <b>flechas del teclado</b> para desviar o acelerar cada bloque en vuelo.</span>
          </li>
        </ul>
      </div>

      {/* Botón Neón de Inicio */}
      <Link
        to="/juego"
        style={{
          fontFamily: "'Orbitron', monospace",
          padding: '14px 32px',
          fontSize: '1rem',
          fontWeight: '800',
          letterSpacing: '2px',
          color: '#ffffff',
          textDecoration: 'none',
          background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.28) 0%, rgba(157, 0, 255, 0.42) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 243, 255, 0.75)',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(0, 243, 255, 0.45), inset 0 0 8px rgba(0, 243, 255, 0.25)',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        ¡INICIAR JUEGO! ▶
      </Link>
    </div>
  );
}