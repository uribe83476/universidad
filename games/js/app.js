// Espera a que exista el HTML antes de buscar botones y tableros.
document.addEventListener("DOMContentLoaded", () => {
  // Prepara las reglas propias de cada juego.
  window.initializeSnake();
  window.initializeTriqui();

  // Busca el formulario que guarda el nombre del jugador.
  const playerForm = document.querySelector("#player-form");
  const playerInput = document.querySelector("#player-name");
  const playerGreeting = document.querySelector("#player-greeting");
  const languageButton = document.querySelector("#language-toggle");

  /** Muestra el saludo y completa el campo con el nombre guardado. */
  function renderGreeting() {
    const savedName = localStorage.getItem("club-player-name") || "";
    playerInput.value = savedName;
    playerGreeting.textContent = savedName ? window.I18n.t("helloName", { name: savedName }) : window.I18n.t("chooseName");
  }
  renderGreeting();

  // Al enviar el formulario, guarda el nombre y actualiza el saludo.
  playerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const playerName = playerInput.value.trim();
    if (!playerName) return;
    localStorage.setItem("club-player-name", playerName);
    renderGreeting();
  });

  // Cambia al otro idioma y guarda la elección en el navegador.
  languageButton.addEventListener("click", () => {
    const nextLanguage = window.I18n.getLanguage() === "es" ? "en" : "es";
    window.I18n.setLanguage(nextLanguage);
  });
  document.addEventListener("arcade:languagechange", renderGreeting);

  // Relaciona cada pestaña con el panel del juego que le corresponde.
  const tabs = [...document.querySelectorAll("[data-game-target]")];
  const views = {
    snake: document.querySelector("#snake-view"),
    triqui: document.querySelector("#triqui-view")
  };

  // Al pulsar una pestaña, cambia el juego visible y su estado seleccionado.
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedGame = tab.dataset.gameTarget;
      document.dispatchEvent(new CustomEvent("arcade:gamechange", { detail: selectedGame }));
      // Marca la pestaña elegida y desmarca la otra.
      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      // Oculta un juego y muestra el panel seleccionado.
      Object.entries(views).forEach(([name, view]) => { view.hidden = name !== selectedGame; });
    });
  });

  // Aplica el idioma guardado al cargar toda la aplicación.
  window.I18n.apply();
});