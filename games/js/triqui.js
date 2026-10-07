/** Prepara las casillas, los turnos, el marcador y el historial de Triqui. */
window.initializeTriqui = function initializeTriqui() {
  // Guarda las nueve casillas y los textos que se actualizarán en pantalla.
  const cells = [...document.querySelectorAll(".tic-cell")];
  const status = document.querySelector("#triqui-status");
  const scoreElements = {
    X: document.querySelector("#triqui-score-x"),
    O: document.querySelector("#triqui-score-o"),
    draw: document.querySelector("#triqui-score-draw")
  };
  const storageKey = "club-triqui-score";
  const historyList = document.querySelector("#triqui-history");
  // Cada grupo de tres posiciones representa una línea que puede ganar.
  const winningLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let scores;
  // Intenta recuperar el marcador anterior; si falla, usa valores iniciales.
  try {
    scores = JSON.parse(localStorage.getItem(storageKey)) || { X: 0, O: 0, draw: 0, history: [] };
    if (![scores.X, scores.O, scores.draw].every(Number.isFinite)) throw new Error("Marcador inválido");
  } catch {
    scores = { X: 0, O: 0, draw: 0, history: [] };
  }
  if (!Array.isArray(scores.history)) scores.history = [];
  // board guarda X, O o null en cada casilla; empieza sin marcas.
  let board = Array(9).fill(null);
  let currentPlayer = "X";
  let roundActive = true;
  let roundOutcome = null;

  /** Muestra el total de victorias y empates en el marcador. */
  function renderScores() {
    scoreElements.X.textContent = scores.X;
    scoreElements.O.textContent = scores.O;
    scoreElements.draw.textContent = scores.draw;
  }

  /** Conserva una copia local y actualiza el marcador y el historial visible. */
  function saveLocalScores() {
    if (!Array.isArray(scores.history)) scores.history = [];
    localStorage.setItem(storageKey, JSON.stringify(scores));
    renderScores();
    renderHistory();
  }

  /** Muestra las cinco partidas más recientes con ganador y fecha. */
  function renderHistory() {
    historyList.replaceChildren();
    if (!scores.history.length) {
      const empty = document.createElement("li");
      empty.className = "history-empty";
      empty.textContent = window.I18n.t("emptyHistory");
      historyList.append(empty);
      return;
    }
    scores.history.slice(0, 5).forEach((record) => {
      const item = document.createElement("li");
      item.className = "history-item";
      const title = document.createElement("span");
      title.className = "history-title";
      title.textContent = record.winner === "draw"
        ? window.I18n.t("drawEntry")
        : window.I18n.t("winEntry", { player: record.winner });
      const detail = document.createElement("span");
      detail.className = "history-detail";
      const date = new Date(record.playedAt);
      const locale = window.I18n.getLanguage() === "en" ? "en-US" : "es";
      const formattedDate = Number.isNaN(date.getTime()) ? window.I18n.t("unknownDate") : new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(date);
      detail.textContent = `${record.player || "Invitado"} · ${formattedDate}`;
      item.append(title, detail);
      historyList.append(item);
    });
  }

  // El servidor es la copia principal; el navegador sirve de respaldo local.
  window.GameApi.getScores().then((result) => {
    scores = result.triqui;
    if (!Array.isArray(scores.history)) scores.history = [];
    saveLocalScores();
  }).catch(() => {});

  /** Traduce y muestra el turno actual, el ganador o un empate. */
  function renderStatus() {
    let message;
    if (roundOutcome?.type === "winner") {
      message = window.I18n.t("triquiWinner", { player: roundOutcome.player });
    } else if (roundOutcome?.type === "draw") {
      message = window.I18n.t("triquiDraw");
    } else {
      message = window.I18n.t("triquiTurn", { player: currentPlayer });
    }
    status.textContent = message;
    status.dataset.player = currentPlayer;
  }

  /** Actualiza las etiquetas de las casillas para lectores de pantalla. */
  function renderCellLabels() {
    cells.forEach((cell, index) => {
      const mark = board[index];
      const label = mark
        ? window.I18n.t("markedCell", { number: index + 1, mark })
        : window.I18n.t("emptyCell", { number: index + 1 });
      cell.setAttribute("aria-label", label);
    });
  }

  /** Vacía el tablero y comienza una ronda nueva con X. */
  function startNewRound() {
    board = Array(9).fill(null);
    currentPlayer = "X";
    roundActive = true;
    roundOutcome = null;
    cells.forEach((cell, index) => {
      cell.textContent = "";
      cell.disabled = false;
      cell.classList.remove("is-winning");
      delete cell.dataset.mark;
      cell.setAttribute("aria-label", window.I18n.t("emptyCell", { number: index + 1 }));
    });
    renderStatus();
  }

  /** Marca la casilla elegida y comprueba victoria, empate o próximo turno.
   * @param {HTMLButtonElement} cell Botón que representa la casilla elegida.
   * @param {number} index Posición de esa casilla dentro del tablero.
   */
  function takeTurn(cell, index) {
    if (!roundActive || board[index]) return;
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.dataset.mark = currentPlayer;
    cell.disabled = true;
    cell.setAttribute("aria-label", window.I18n.t("markedCell", { number: index + 1, mark: currentPlayer }));
    // Busca si el jugador actual completó alguna línea ganadora.
    const winningLine = winningLines.find((line) => line.every((position) => board[position] === currentPlayer));
    if (winningLine) {
      // Suma la victoria, resalta las casillas y guarda el resultado.
      roundActive = false;
      roundOutcome = { type: "winner", player: currentPlayer };
      scores[currentPlayer] += 1;
      winningLine.forEach((position) => cells[position].classList.add("is-winning"));
      const player = localStorage.getItem("club-player-name") || "Invitado";
      scores.history = [{ winner: currentPlayer, player, playedAt: new Date().toISOString() }, ...scores.history].slice(0, 20);
      saveLocalScores();
      window.GameApi.recordTriquiResult(currentPlayer, player).then((result) => {
        scores = result.triqui;
        saveLocalScores();
      }).catch(() => {});
      renderStatus();
      cells.forEach((button) => { button.disabled = true; });
      return;
    }
    // Si no quedan casillas vacías y nadie ganó, la partida es empate.
    if (board.every(Boolean)) {
      roundActive = false;
      roundOutcome = { type: "draw" };
      scores.draw += 1;
      const player = localStorage.getItem("club-player-name") || "Invitado";
      scores.history = [{ winner: "draw", player, playedAt: new Date().toISOString() }, ...scores.history].slice(0, 20);
      saveLocalScores();
      window.GameApi.recordTriquiResult("draw", player).then((result) => {
        scores = result.triqui;
        saveLocalScores();
      }).catch(() => {});
      renderStatus();
      cells.forEach((button) => { button.disabled = true; });
      return;
    }
    // Si la partida sigue, cambia entre X y O.
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    renderStatus();
  }

  // Cada botón del tablero envía su posición a la función de turnos.
  cells.forEach((cell) => cell.addEventListener("click", () => takeTurn(cell, Number(cell.dataset.cell))));
  // Traduce el mensaje y los nombres de casilla al cambiar de idioma.
  document.addEventListener("arcade:languagechange", () => {
    renderHistory();
    renderStatus();
    renderCellLabels();
  });
  // Conecta los botones para empezar otra ronda o reiniciar solo el marcador.
  document.querySelector("#triqui-new-round").addEventListener("click", startNewRound);
  document.querySelector("#triqui-reset-score").addEventListener("click", () => {
    scores = { X: 0, O: 0, draw: 0, history: scores.history };
    saveLocalScores();
    window.GameApi.resetTriquiScores().then((result) => {
      scores = result.triqui;
      saveLocalScores();
    }).catch(() => {});
  });
  renderScores();
  renderStatus();
};