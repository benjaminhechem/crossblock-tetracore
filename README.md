# ⚡ TETRACORE — Sistema Arcade 7x7

**TetraCore** es un videojuego web de acción y estrategia tipo arcade desarrollado como Proyecto Integrador Final para la asignatura **Contenidos y Creatividad III (Videojuegos: Experiencias Interactivas)** de la Licenciatura en Comunicación Digital (Universidad de Palermo).

🔗 **Jugar online (Despliegue en Vercel):** [https://crossblock-tetracore.vercel.app](https://crossblock-tetracore.vercel.app)

---

## 📋 Ficha Académica

* **Institución:** Universidad de Palermo (UP) — Facultad de Diseño y Comunicación
* **Carrera:** Licenciatura en Comunicación Digital
* **Asignatura:** Contenidos y Creatividad III
* **Docente:** Tec. Agustín Lopez
* **Autor:** Benjamín Hechem

---

## 🎮 Concepto y Mecánicas de Juego

Ambientado en una interfaz **Cyber-Arcade**, el jugador asume el rol de un piloto encargado de estabilizar un núcleo energético de **7x7 celdas** antes de que colapse por saturación de bloques.

* **4 Cañones Direccionales:** Disparan bloques de colores desde los cuatro puntos cardinales (arriba, abajo, izquierda y derecha) hacia el centro de la arena.
* **Control en Vuelo:** Mediante las **flechas del teclado**, el jugador puede desviar lateralmente o acelerar cada bloque mientras se desplaza hacia el núcleo.
* **Sistema Match-3:** Al alinear o agrupar **3 o más bloques contiguos del mismo color**, estos se eliminan del tablero, liberan espacio y suman puntos al marcador.
* **Identificación y Ranking Arcade:** Antes de iniciar la partida, el jugador registra sus **3 iniciales** de piloto para competir por el puntaje máximo almacenado en el ranking local.

---

## 🎨 Identidad Visual y Diseño UI/UX

El diseño visual fue construido bajo una estética **Cyber-Arcade** coherente en todas las pantallas (`Inicio`, `Identificación de Piloto`, `Arena 7x7` y `Game Over`):

* **Paleta Cromática:** Fondo oscuro con grilla técnica y contrastes de alto impacto en cian neón (`#00f3ff`), magenta y bloques energéticos saturados.
* **Glassmorfismo:** Paneles translúcidos con desenfoque de fondo (`backdrop-filter: blur`), bordes luminosos y sombras interiores.
* **Tipografía:** Combinación de **Orbitron** (títulos, marcadores y botones de acción) y **Rajdhani** (reglas e indicadores de interfaz).

---

## 🛠️ Tecnologías Utilizadas

* **React + Vite:** Arquitectura basada en componentes funcionales y gestión de estado mediante Hooks (`useState`, `useEffect`, `useRef`).
* **React Router DOM:** Navegación fluida entre vistas (`/` y `/juego`) configurada como Single Page Application (SPA) mediante `vercel.json`.
* **CSS3:** Estilos modulares, cuadrícula CSS Grid para el tablero 7x7 y efectos visuales neón.
* **GitHub + Vercel:** Control de versiones y despliegue continuo en producción.

---

## 🤖 Proceso de Desarrollo Asistido por IA

El desarrollo de **TetraCore** se llevó a cabo mediante un flujo de trabajo iterativo asistido por inteligencia artificial, dividido en cuatro etapas:

1. **Prototipado de Lógica y Game Loop:** Estructuración del tablero matricial de 7x7, física de desplazamiento de proyectiles desde los 4 cañones y algoritmo de detección de coincidencias (Match-3).
2. **Modularización en React:** Separación de responsabilidades en componentes reutilizables (`Home`, `Game`, `GameBoard`, `Cannon`, `Controls`, `Header`, `Footer`) e integración de rutas con React Router.
3. **Rediseño Estético (Cyber-Arcade):** Transformación de una interfaz prototipo plana hacia un sistema visual unificado con glassmorfismo, tipografías arcade y jerarquía clara entre tablero, controles y paneles de estado.
4. **Depuración y Despliegue en Producción:** Resolución de sensibilidad de mayúsculas en rutas de importación entre entornos Windows y Linux, verificación de compilación (`npm run build`) y configuración de reescritura de rutas (`vercel.json`) para evitar errores 404 en Vercel.

---

## 🧪 Pruebas de Usabilidad y Ajustes Realizados

> *Registro de validación con usuario externo al desarrollo (requisito Momento 3):*

* **Usuario evaluador:** [Completar con nombre o perfil del tester]
* **Dispositivo y navegador utilizado:** [Completar, ej.: Notebook Windows / Chrome]
* **Observaciones detectadas durante la partida:**
  * [Completar con lo que comentó el usuario al probarlo, ej.: comprensión de las reglas iniciales, visibilidad del próximo bloque o velocidad de los disparos]
* **Ajustes implementados a partir de la prueba:**
  * [Completar con la mejora aplicada o validación de usabilidad]

---

## 💻 Ejecución Local

Si deseás correr el proyecto de forma local:

```bash
# Clonar el repositorio
git clone https://github.com/benjaminhechem/tetracore.git

# Entrar a la carpeta del proyecto
cd tetracore

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev