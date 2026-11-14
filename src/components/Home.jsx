import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '20px',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      {/* Título Principal */}
      <h1
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          color: '#00f3ff',
          letterSpacing: '6px',
          textShadow: '0 0 20px rgba(0, 243, 255, 0.6)',
          margin: '0 0 5px 0',
        }}
      >
        TETRACORE
      </h1>
      <h2
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(1rem, 2vw, 1.4rem)',
          color: '#ec4899',
          letterSpacing: '4px',
          margin: '0 0 40px 0',
          textShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
        }}
      >
        SISTEMA ARCADE 7x7
      </h2>

      {/* Tarjeta de Instrucciones Pulida */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          borderRadius: '16px',
          padding: '30px 40px',
          maxWidth: '550px',
          width: '100%',
          boxShadow:
            '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 243, 255, 0.05)',
          textAlign: 'left',
          marginBottom: '40px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Orbitron', monospace",
            color: '#fbbf24',
            fontSize: '1.1rem',
            textAlign: 'center',
            letterSpacing: '2px',
            margin: '0 0 24px 0',
            borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
            paddingBottom: '12px',
          }}
        >
          MANDOS DE MISIÓN
        </h3>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontFamily: "'Rajdhani', sans-serif",
            color: '#cbd5e1',
            fontSize: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#00f3ff', marginTop: '2px' }}>▶</span>
            <span style={{ lineHeight: '1.4' }}>
              <strong>4 Cañones</strong> disparan bloques de energía hacia el núcleo central.
            </span>
          </li>
          <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#fbbf24', marginTop: '2px' }}>▶</span>
            <span style={{ lineHeight: '1.4' }}>
              Usá las <strong>flechas del teclado</strong> para desviar lateralmente o acelerar la caída del bloque.
            </span>
          </li>
          <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#00ff66', marginTop: '2px' }}>▶</span>
            <span style={{ lineHeight: '1.4' }}>
              Agrupá <strong>3 o más colores contiguos</strong> para purgar el sector y sumar puntos.
            </span>
          </li>
          <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#ec4899', marginTop: '2px' }}>▶</span>
            <span style={{ lineHeight: '1.4' }}>
              Si un cañón se llena, se <strong>bloquea</strong> (podés seguir desde los libres). El núcleo colapsa si se tapan los <strong>4 a la vez</strong>.
            </span>
          </li>
        </ul>
      </div>

      {/* Botón Jugar */}
      <Link to="/juego" style={{ textDecoration: 'none' }}>
        <button
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#fff',
            background:
              'linear-gradient(135deg, rgba(0, 243, 255, 0.2) 0%, rgba(157, 0, 255, 0.4) 100%)',
            border: '2px solid rgba(0, 243, 255, 0.8)',
            borderRadius: '12px',
            padding: '14px 36px',
            cursor: 'pointer',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow:
              '0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow =
              '0 0 30px rgba(0, 243, 255, 0.6), inset 0 0 15px rgba(0, 243, 255, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow =
              '0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.2)';
          }}
        >
          INICIAR JUEGO
        </button>
      </Link>
    </div>
  );
}