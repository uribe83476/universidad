(() => {
  /**
   * Envía una solicitud y convierte la respuesta JSON en datos de JavaScript.
   * @param {string} path Dirección API que recibirá la solicitud.
   * @param {Object} options Método HTTP y contenido que se enviará.
   * @returns {Promise<Object>} Respuesta del servidor convertida en objeto.
   */
  async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo completar la solicitud");
    return result;
  }

  // Funciones que usan los juegos para leer y actualizar datos guardados.
  window.GameApi = {
    // Lee récords y los historiales de ambos juegos.
    getScores: () => request("/api/scores"),
    // Guarda un nuevo récord de Snake si supera al anterior.
    updateSnakeBest: (score) => request("/api/scores/snake", {
      method: "POST",
      body: JSON.stringify({ score })
    }),
    // Registra cómo terminó una partida de Snake.
    recordSnakeGame: (score, player) => request("/api/history/snake", {
      method: "POST",
      body: JSON.stringify({ score, player })
    }),
    // Registra quién ganó Triqui o si la partida terminó en empate.
    recordTriquiResult: (winner, player) => request("/api/scores/triqui", {
      method: "POST",
      body: JSON.stringify({ winner, player })
    }),
    // Pone los totales de Triqui en cero.
    resetTriquiScores: () => request("/api/scores/triqui", { method: "DELETE" })
  };
})();