// Frases de la interfaz en los dos idiomas disponibles.
const translations = {
  es: {
    pageTitle: "Club de juegos",
    pageDescription: "Una colección de juegos clásicos: Snake y Triqui.",
    brandName: "Club de juegos",
    brandHome: "Club de juegos, inicio",
    selectGame: "Seleccionar juego",
    snakeTab: "Snake",
    triquiTab: "Triqui",
    playerName: "Tu nombre",
    playerPlaceholder: "Escribe tu nombre",
    saveName: "Guardar nombre",
    chooseName: "Elige un nombre para jugar",
    helloName: "¡Hola, {name}!",
    changeToEnglish: "Cambiar el idioma a inglés",
    changeToSpanish: "Cambiar el idioma a español",
    snakeGame: "Juego Snake",
    arcadeOne: "Arcade · 01",
    snakeSlogan: "¡A por el récord!",
    points: "PUNTOS",
    best: "RÉCORD",
    snakeBoard: "Tablero Snake. Usa las flechas o WASD para moverte.",
    snakeReady: "¿Listo para jugar?",
    snakeReadyMessage: "Recoge las manzanas y evita chocar contigo mismo o con el borde.",
    snakeStart: "Empezar partida",
    snakeGameOver: "¡Fin de la partida!",
    snakeGameOverMessage: "Has conseguido {score} puntos. ¿Una revancha?",
    snakePlayAgain: "Jugar otra vez",
    snakePaused: "Partida en pausa",
    snakePausedMessage: "Vas por {score} puntos. Cuando quieras, seguimos.",
    continue: "Continuar",
    moveWith: "Mueve con",
    or: "o",
    pause: "Pausar o reanudar",
    restart: "Reiniciar partida",
    directionControls: "Controles de dirección",
    up: "Arriba",
    left: "Izquierda",
    down: "Abajo",
    right: "Derecha",
    customize: "Personaliza",
    chooseShape: "Elige tu figura",
    shapeDescription: "Dale un estilo a tu serpiente. Puedes cambiarlo cuando quieras.",
    roundShape: "Redonda",
    roundDescription: "Suave y clásica",
    squareShape: "Cuadrada",
    squareDescription: "Firme y ordenada",
    triangleShape: "Triangular",
    triangleDescription: "Punta de velocidad",
    howToPlay: "Cómo jugar",
    snakeTipStart: "Cada manzana suma",
    tenPoints: "10 puntos",
    snakeTipEnd: "y alarga tu serpiente. ¡No te muerdas la cola!",
    recentHistory: "Historial reciente",
    emptyHistory: "Aún no hay partidas.",
    scoreEntry: "{score} puntos",
    unknownDate: "Fecha desconocida",
    twoPlayers: "Dos jugadores · 02",
    triquiGame: "Juego Triqui",
    threeInARow: "Tres en línea",
    triquiTurn: "Turno de {player} · Elige una casilla",
    triquiBoard: "Tablero de Triqui",
    emptyCell: "Casilla {number}: vacía",
    markedCell: "Casilla {number}: {mark}",
    xStarts: "X empieza · juega por turnos",
    newRound: "Nueva partida",
    scoreboard: "Marcador",
    gamesWon: "Partidas ganadas",
    scoresSaved: "El marcador se guarda en el servidor local.",
    draws: "Empates",
    objective: "Objetivo",
    triquiTip: "Alinea tres símbolos en horizontal, vertical o diagonal antes que tu rival.",
    triquiWinner: "¡Gana {player}! · Inicia otra partida",
    triquiDraw: "¡Empate! · Inicia otra partida",
    winEntry: "Ganó {player}",
    drawEntry: "Empate",
    clearScore: "Borrar marcador",
    footer: "Hecho para jugar · Snake y Triqui"
  },
  en: {
    pageTitle: "Game Club",
    pageDescription: "A collection of classic games: Snake and Tic-tac-toe.",
    brandName: "Game Club",
    brandHome: "Game Club, home",
    selectGame: "Choose a game",
    snakeTab: "Snake",
    triquiTab: "Tic-tac-toe",
    playerName: "Your name",
    playerPlaceholder: "Enter your name",
    saveName: "Save name",
    chooseName: "Choose a name to play",
    helloName: "Hello, {name}!",
    changeToEnglish: "Switch language to English",
    changeToSpanish: "Switch language to Spanish",
    snakeGame: "Snake game",
    arcadeOne: "Arcade · 01",
    snakeSlogan: "Go for the high score!",
    points: "SCORE",
    best: "BEST",
    snakeBoard: "Snake board. Use the arrow keys or WASD to move.",
    snakeReady: "Ready to play?",
    snakeReadyMessage: "Collect the apples and avoid hitting yourself or the wall.",
    snakeStart: "Start game",
    snakeGameOver: "Game over!",
    snakeGameOverMessage: "You scored {score} points. Want a rematch?",
    snakePlayAgain: "Play again",
    snakePaused: "Game paused",
    snakePausedMessage: "You have {score} points. Resume whenever you are ready.",
    continue: "Resume",
    moveWith: "Move with",
    or: "or",
    pause: "Pause or resume",
    restart: "Restart game",
    directionControls: "Direction controls",
    up: "Up",
    left: "Left",
    down: "Down",
    right: "Right",
    customize: "Customize",
    chooseShape: "Choose a shape",
    shapeDescription: "Choose a look for your snake. You can change it at any time.",
    roundShape: "Round",
    roundDescription: "Smooth and classic",
    squareShape: "Square",
    squareDescription: "Solid and neat",
    triangleShape: "Triangle",
    triangleDescription: "Pointy and fast",
    howToPlay: "How to play",
    snakeTipStart: "Each apple is worth",
    tenPoints: "10 points",
    snakeTipEnd: "and makes your snake longer. Don't bite your tail!",
    recentHistory: "Recent games",
    emptyHistory: "No games yet.",
    scoreEntry: "{score} points",
    unknownDate: "Unknown date",
    twoPlayers: "Two players · 02",
    triquiGame: "Tic-tac-toe game",
    threeInARow: "Three in a row",
    triquiTurn: "{player}'s turn · Choose a square",
    triquiBoard: "Tic-tac-toe board",
    emptyCell: "Square {number}: empty",
    markedCell: "Square {number}: {mark}",
    xStarts: "X goes first · Take turns",
    newRound: "New game",
    scoreboard: "Scoreboard",
    gamesWon: "Games won",
    scoresSaved: "Scores are saved on the local server.",
    draws: "Draws",
    objective: "Objective",
    triquiTip: "Line up three symbols horizontally, vertically, or diagonally before your opponent.",
    triquiWinner: "{player} wins! · Start another game",
    triquiDraw: "It's a draw! · Start another game",
    winEntry: "{player} won",
    drawEntry: "Draw",
    clearScore: "Clear scoreboard",
    footer: "Made for play · Snake and Tic-tac-toe"
  }
};

// El idioma se conserva en el navegador; español es el idioma inicial.
let currentLanguage = localStorage.getItem("club-language") === "en" ? "en" : "es";

/**
 * Busca una frase en el idioma activo y reemplaza marcadores como {name}.
 * @param {string} key Nombre de la frase que se quiere mostrar.
 * @param {Object} values Valores que se insertan dentro de la frase.
 * @returns {string} Frase traducida y lista para mostrar.
 */
function translate(key, values = {}) {
  const phrase = translations[currentLanguage][key] || translations.es[key] || key;
  // Cada marcador se cambia por el valor enviado por quien llama la función.
  return phrase.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

/**
 * Actualiza textos, etiquetas para accesibilidad y datos del documento.
 * @returns {void}
 */
function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = translate("pageTitle");
  document.querySelector('meta[name="description"]').content = translate("pageDescription");

  // Traduce los elementos que tienen una clave data-i18n en el HTML.
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  const translatedAttributes = ["aria-label", "title", "placeholder"];
  translatedAttributes.forEach((attribute) => {
    const dataAttribute = `data-i18n-${attribute}`;
    document.querySelectorAll(`[${dataAttribute}]`).forEach((element) => {
      element.setAttribute(attribute, translate(element.getAttribute(dataAttribute)));
    });
  });

  const languageButton = document.querySelector("#language-toggle");
  if (languageButton) {
    const nextLanguage = currentLanguage === "es" ? "en" : "es";
    languageButton.textContent = nextLanguage.toUpperCase();
    languageButton.setAttribute("aria-label", translate(nextLanguage === "en" ? "changeToEnglish" : "changeToSpanish"));
    languageButton.title = translate(nextLanguage === "en" ? "changeToEnglish" : "changeToSpanish");
  }

  // Los juegos escuchan este aviso para traducir mensajes creados durante la partida.
  document.dispatchEvent(new CustomEvent("arcade:languagechange", { detail: currentLanguage }));
}

// Este objeto permite que el resto del proyecto use las traducciones.
window.I18n = {
  /** Traduce una frase para usarla desde otro archivo. */
  t: translate,
  /** Devuelve el código del idioma activo: es o en. */
  getLanguage: () => currentLanguage,
  /** Vuelve a traducir los textos que tienen claves en el HTML. */
  apply: applyTranslations,
  /**
   * Cambia el idioma, guarda la preferencia y actualiza la pantalla.
   * @param {string} language Código del idioma: es o en.
   */
  setLanguage(language) {
    if (!translations[language]) return;
    currentLanguage = language;
    localStorage.setItem("club-language", currentLanguage);
    applyTranslations();
  }
};