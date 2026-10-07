# Club de juegos

Colección web de Snake y Triqui con una API local para guardar sus marcadores.

## Requisitos

- Windows PowerShell 5.1 o posterior
- Navegador web moderno

No requiere instalar paquetes.

## Ejecutar

Desde esta carpeta, abre PowerShell y ejecuta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\server.ps1
```

Abre `http://localhost:8000/` en el navegador. Para usar otro puerto, indica el número al final del comando, por ejemplo `-Port 8080`.

## API

- `GET /api/health`: comprueba que el servidor responde.
- `GET /api/scores`: consulta récords, marcadores e historiales recientes.
- `POST /api/scores/snake` con `{"score": 120}`: actualiza el récord de Snake si el puntaje es mayor.
- `POST /api/history/snake` con `{"score": 120, "player": "Ana"}`: guarda el resultado de una partida de Snake.
- `POST /api/scores/triqui` con `{"winner": "X", "player": "Ana"}`, `{"winner": "O"}` o `{"winner": "draw"}`: registra el marcador y el historial.
- `DELETE /api/scores/triqui`: reinicia el marcador de Triqui sin borrar el historial.

Los datos se guardan en `data/scores.json`; se conservan hasta 20 partidas por juego y la interfaz muestra las cinco más recientes. La API escucha solo en el equipo local y no tiene autenticación; es para uso y presentación local.

## Estructura

```text
index.html       Interfaz de los dos juegos
css/styles.css   Estilos y diseño adaptable
js/app.js        Selector y navegación entre juegos
js/i18n.js       Textos en español e inglés
js/api.js        Cliente de la API
js/snake.js      Lógica de Snake
js/triqui.js     Lógica de Triqui
server.ps1       Servidor web y API
data/scores.json Marcadores persistentes
```