/** Prepara tablero, controles y estado inicial de Snake. */
window.initializeSnake = function initializeSnake() {
  // Guarda referencias a partes del HTML para actualizarlas desde JavaScript.
  const canvas = document.querySelector("#snake-board");
  const context = canvas.getContext("2d");
  const scoreElement = document.querySelector("#snake-score");
  const bestElement = document.querySelector("#snake-best");
  const overlay = document.querySelector("#snake-overlay");
  const overlayTitle = document.querySelector("#snake-overlay-title");
  const overlayMessage = document.querySelector("#snake-overlay-message");
  const startButton = document.querySelector("#snake-start");
  const snakeView = document.querySelector("#snake-view");
  // El tablero se divide en casillas iguales para mover la serpiente por pasos.
  const tileCount = 21;
  const tileSize = canvas.width / tileCount;
  // Cada dirección indica cuántas casillas mover en horizontal y vertical.
  const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  // Estas variables cambian mientras la partida avanza.
  let snake;
  let direction;
  let nextDirection;
  let food;
  let score = 0;
  let best = Number(localStorage.getItem("snake-club-best") || 0);
  let shape = localStorage.getItem("snake-club-shape") || "circle";
  let timer = null;
  let running = false;
  let paused = false;
  let gameRecorded = false;
  let history = [];

  // Recupera el historial guardado; si los datos no sirven, empieza vacío.
  try {
    history = JSON.parse(localStorage.getItem("club-snake-history") || "[]");
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  // Muestra el récord y sincroniza historial y puntuación con el servidor.
  bestElement.textContent = best;
  renderHistory();
  window.GameApi.getScores().then((scores) => {
    const serverBest = Number(scores.snake.best) || 0;
    if (serverBest > best) {
      best = serverBest;
      bestElement.textContent = best;
      localStorage.setItem("snake-club-best", String(best));
    } else if (best > serverBest) {
      window.GameApi.updateSnakeBest(best).catch(() => {});
    }
    if (Array.isArray(scores.snake.history)) {
      history = scores.snake.history;
      localStorage.setItem("club-snake-history", JSON.stringify(history));
      renderHistory();
    }
  }).catch(() => {});

  /** Actualiza en pantalla las cinco partidas más recientes. */
  function renderHistory() {
    const list = document.querySelector("#snake-history");
    list.replaceChildren();
    if (!history.length) {
      const empty = document.createElement("li");
      empty.className = "history-empty";
      empty.textContent = window.I18n.t("emptyHistory");
      list.append(empty);
      return;
    }
    history.slice(0, 5).forEach((record) => {
      const item = document.createElement("li");
      item.className = "history-item";
      const title = document.createElement("span");
      title.className = "history-title";
      title.textContent = window.I18n.t("scoreEntry", { score: Number(record.score) || 0 });
      const detail = document.createElement("span");
      detail.className = "history-detail";
      const date = new Date(record.playedAt);
      const locale = window.I18n.getLanguage() === "en" ? "en-US" : "es";
      const formattedDate = Number.isNaN(date.getTime()) ? window.I18n.t("unknownDate") : new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(date);
      detail.textContent = `${record.player || "Invitado"} · ${formattedDate}`;
      item.append(title, detail);
      list.append(item);
    });
  }

  /** Coloca la comida en una casilla libre del tablero. */
  function placeFood() {
    do { food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) }; }
    while (snake.some((part) => part.x === food.x && part.y === food.y));
  }

  /** Dibuja los ojos de la cabeza para que miren hacia el movimiento actual.
   * @param {number} x Posición horizontal de la cabeza en el canvas.
   * @param {number} y Posición vertical de la cabeza en el canvas.
   * @param {number} size Tamaño de la casilla que ocupa la cabeza.
   */
  function drawEyes(x, y, size) {
    context.fillStyle = "#fffdf8";
    const eyeSize = 2.5;
    let eyes;
    if (direction.x === 1) eyes = [[0.68, 0.3], [0.68, 0.68]];
    else if (direction.x === -1) eyes = [[0.26, 0.3], [0.26, 0.68]];
    else if (direction.y === -1) eyes = [[0.3, 0.26], [0.68, 0.26]];
    else eyes = [[0.3, 0.68], [0.68, 0.68]];
    eyes.forEach(([eyeX, eyeY]) => {
      context.beginPath();
      context.arc(x + size * eyeX, y + size * eyeY, eyeSize, 0, Math.PI * 2);
      context.fill();
    });
  }

  /** Dibuja el fondo, la comida y cada segmento de la serpiente. */
  function draw() {
    // Pinta el fondo y las líneas que separan las casillas.
    context.fillStyle = "#e8edda";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgb(77 101 66 / 8%)";
    context.lineWidth = 1;
    for (let index = 0; index <= tileCount; index += 1) {
      const position = index * tileSize;
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, canvas.height);
      context.moveTo(0, position);
      context.lineTo(canvas.width, position);
      context.stroke();
    }
    // Dibuja la comida y su tallo.
    context.fillStyle = "#e86d52";
    context.beginPath();
    context.arc((food.x + 0.5) * tileSize, (food.y + 0.5) * tileSize, tileSize * 0.34, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#35563a";
    context.fillRect((food.x + 0.48) * tileSize, (food.y + 0.08) * tileSize, tileSize * 0.08, tileSize * 0.19);
    // Dibuja cada segmento; el primero es la cabeza.
    snake.forEach((part, index) => {
      const inset = index === 0 ? 2 : 3;
      const x = part.x * tileSize + inset;
      const y = part.y * tileSize + inset;
      const size = tileSize - inset * 2;
      context.fillStyle = index === 0 ? "#35563a" : "#638b56";
      context.beginPath();
      if (shape === "circle") context.arc(x + size / 2, y + size / 2, size * 0.48, 0, Math.PI * 2);
      else if (shape === "square") context.roundRect(x, y, size, size, 3);
      else {
        context.moveTo(x + size / 2, y + 1);
        context.lineTo(x + size - 1, y + size - 1);
        context.lineTo(x + 1, y + size - 1);
        context.closePath();
      }
      context.fill();
      if (index === 0) drawEyes(x, y, size);
    });
  }

  /** Reinicia la posición, la dirección, el puntaje y la comida. */
  function resetState() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = directions.right;
    nextDirection = direction;
    score = 0;
    scoreElement.textContent = score;
    placeFood();
    draw();
  }

  /** Cambia el rumbo y evita que la serpiente se dé vuelta sobre sí misma.
   * @param {string} name Nombre de la nueva dirección.
   */
  function setDirection(name) {
    const candidate = directions[name];
    if (!candidate || (candidate.x + direction.x === 0 && candidate.y + direction.y === 0)) return;
    nextDirection = candidate;
  }

  /** Traduce los mensajes del cuadro según si está listo, pausado o terminó. */
  function renderOverlay() {
    if (paused) {
      overlayTitle.textContent = window.I18n.t("snakePaused");
      overlayMessage.textContent = window.I18n.t("snakePausedMessage", { score });
      startButton.textContent = window.I18n.t("continue");
    } else if (gameRecorded) {
      overlayTitle.textContent = window.I18n.t("snakeGameOver");
      overlayMessage.textContent = window.I18n.t("snakeGameOverMessage", { score });
      startButton.textContent = window.I18n.t("snakePlayAgain");
    } else {
      overlayTitle.textContent = window.I18n.t("snakeReady");
      overlayMessage.textContent = window.I18n.t("snakeReadyMessage");
      startButton.textContent = window.I18n.t("snakeStart");
    }
  }

  /** Detiene la partida y registra el resultado cuando hay una colisión. */
  function endGame() {
    clearInterval(timer);
    running = false;
    paused = false;
    // Guarda la partida una sola vez aunque se repita este evento.
    if (!gameRecorded) {
      gameRecorded = true;
      const player = localStorage.getItem("club-player-name") || "Invitado";
      history = [{ score, player, playedAt: new Date().toISOString() }, ...history].slice(0, 20);
      localStorage.setItem("club-snake-history", JSON.stringify(history));
      renderHistory();
      window.GameApi.recordSnakeGame(score, player).then((result) => {
        if (Array.isArray(result.snake.history)) {
          history = result.snake.history;
          localStorage.setItem("club-snake-history", JSON.stringify(history));
          renderHistory();
        }
      }).catch(() => {});
    }
    renderOverlay();
    overlay.hidden = false;
  }

  /** Avanza un paso, comprueba colisiones y actualiza comida y puntaje. */
  function tick() {
    if (!running || paused) return;
    direction = nextDirection;
    // Calcula dónde quedaría la cabeza en el siguiente paso.
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const eating = head.x === food.x && head.y === food.y;
    const bodyToCheck = eating ? snake : snake.slice(0, -1);
    // Si la nueva casilla está fuera del tablero o dentro del cuerpo, termina.
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || bodyToCheck.some((part) => part.x === head.x && part.y === head.y)) {
      endGame();
      return;
    }
    // Agrega la cabeza nueva al frente del cuerpo.
    snake.unshift(head);
    if (eating) {
      // Comer suma puntos y crea otra manzana.
      score += 10;
      scoreElement.textContent = score;
      if (score > best) {
        best = score;
        bestElement.textContent = best;
        localStorage.setItem("snake-club-best", String(best));
        window.GameApi.updateSnakeBest(best).catch(() => {});
      }
      placeFood();
      if (score % 50 === 0) {
        // Cada 50 puntos, reduce el tiempo entre movimientos para aumentar el reto.
        clearInterval(timer);
        timer = setInterval(tick, Math.max(65, 125 - score / 10));
      }
    } else snake.pop();
    draw();
  }

  /** Prepara el estado inicial y empieza el temporizador de movimiento. */
  function startGame() {
    clearInterval(timer);
    resetState();
    gameRecorded = false;
    running = true;
    paused = false;
    overlay.hidden = true;
    timer = setInterval(tick, 125);
  }

  /** Alterna entre pausar y continuar el movimiento automático. */
  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (paused) {
      clearInterval(timer);
      renderOverlay();
      overlay.hidden = false;
    } else {
      overlay.hidden = true;
      timer = setInterval(tick, Math.max(65, 125 - score / 10));
    }
  }

  // Si se abre otro juego, pausa Snake para que no avance oculto.
  document.addEventListener("arcade:gamechange", (event) => {
    if (event.detail !== "snake" && running && !paused) togglePause();
  });

  // Redibuja el historial y los mensajes cuando cambia el idioma.
  document.addEventListener("arcade:languagechange", () => {
    renderHistory();
    if (!overlay.hidden) renderOverlay();
  });

  // Las flechas y WASD controlan la dirección; espacio inicia o pausa.
  document.addEventListener("keydown", (event) => {
    if (snakeView.hidden) return;
    const keyMap = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    if (keyMap[event.key]) {
      event.preventDefault();
      setDirection(keyMap[event.key]);
    } else if (event.code === "Space") {
      event.preventDefault();
      if (!running) startGame();
      else togglePause();
    }
  });
  // Los botones en pantalla permiten girar en teléfonos y tabletas.
  document.querySelectorAll(".direction-button").forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.dir)));
  // Guarda la figura elegida y vuelve a dibujar la serpiente con ese estilo.
  document.querySelectorAll(".shape-option").forEach((button) => {
    const selected = button.dataset.shape === shape;
    button.setAttribute("aria-pressed", String(selected));
    button.querySelector(".selected-mark").textContent = selected ? "✓" : "";
    button.addEventListener("click", () => {
      shape = button.dataset.shape;
      localStorage.setItem("snake-club-shape", shape);
      document.querySelectorAll(".shape-option").forEach((option) => {
        const isSelected = option === button;
        option.setAttribute("aria-pressed", String(isSelected));
        option.querySelector(".selected-mark").textContent = isSelected ? "✓" : "";
      });
      draw();
    });
  });
  // Conecta los botones de empezar, pausar y reiniciar con sus acciones.
  startButton.addEventListener("click", () => {
    if (paused) {
      paused = false;
      overlay.hidden = true;
      timer = setInterval(tick, Math.max(65, 125 - score / 10));
    } else startGame();
  });
  document.querySelector("#snake-pause").addEventListener("click", togglePause);
  document.querySelector("#snake-restart").addEventListener("click", startGame);
  // Dibuja el tablero inicial antes de que el jugador empiece.
  resetState();
};