# Este número es el puerto que se escribe al final de la dirección web.
param([int]$Port = 8000)

$ErrorActionPreference = "Stop"
# PSScriptRoot indica la carpeta donde está este archivo.
$Root = $PSScriptRoot
$DataDirectory = Join-Path $Root "data"
$DataFile = Join-Path $DataDirectory "scores.json"
$RootPrefix = $Root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar

<#
.SYNOPSIS
Crea los marcadores iniciales de los dos juegos.
.OUTPUTS
Hashtable con los puntos y los historiales vacíos.
#>
function New-DefaultScores {
  return @{ snake = @{ best = 0; history = @() }; triqui = @{ X = 0; O = 0; draw = 0; history = @() } }
}

<#
.SYNOPSIS
Lee los marcadores del archivo JSON y completa los historiales si faltan.
.OUTPUTS
Hashtable con los datos de Snake y Triqui.
#>
function Get-Scores {
  if (-not (Test-Path $DataFile)) { return New-DefaultScores }
  try {
    $saved = Get-Content -Path $DataFile -Raw | ConvertFrom-Json
    $snakeHistory = @()
    $triquiHistory = @()
    if ($null -ne $saved.snake.history) { $snakeHistory = @($saved.snake.history) }
    if ($null -ne $saved.triqui.history) { $triquiHistory = @($saved.triqui.history) }
    return @{
      snake = @{ best = [Math]::Max(0, [int]$saved.snake.best); history = $snakeHistory }
      triqui = @{
        X = [Math]::Max(0, [int]$saved.triqui.X)
        O = [Math]::Max(0, [int]$saved.triqui.O)
        draw = [Math]::Max(0, [int]$saved.triqui.draw)
        history = $triquiHistory
      }
    }
  } catch {
    return New-DefaultScores
  }
}

<#
.SYNOPSIS
Guarda los marcadores en disco usando un archivo temporal.
.PARAMETER Scores
Marcadores e historiales que se van a guardar.
#>
function Save-Scores($Scores) {
  if (-not (Test-Path $DataDirectory)) { New-Item -ItemType Directory -Path $DataDirectory | Out-Null }
  $temporaryFile = "$DataFile.tmp"
  ConvertTo-Json -InputObject $Scores -Depth 5 | Set-Content -Path $temporaryFile -Encoding UTF8
  Move-Item -Path $temporaryFile -Destination $DataFile -Force
}

<#
.SYNOPSIS
Envía datos JSON al navegador junto con el código de respuesta HTTP.
.PARAMETER Context
Conexión web que hizo la solicitud.
.PARAMETER StatusCode
Número que indica si la solicitud funcionó, por ejemplo 200 o 404.
.PARAMETER Value
Datos que se convertirán a JSON.
#>
function Send-Json($Context, [int]$StatusCode, $Value) {
  $json = ConvertTo-Json -InputObject $Value -Depth 5 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $Context.Response.StatusCode = $StatusCode
  $Context.Response.ContentType = "application/json; charset=utf-8"
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

<#
.SYNOPSIS
Lee el JSON enviado por el navegador y lo convierte en un objeto.
.PARAMETER Context
Conexión web que contiene el cuerpo de la solicitud.
.OUTPUTS
Objeto con los datos recibidos.
#>
function Read-JsonBody($Context) {
  $reader = New-Object IO.StreamReader($Context.Request.InputStream, [Text.Encoding]::UTF8)
  try { return ($reader.ReadToEnd() | ConvertFrom-Json) }
  finally { $reader.Dispose() }
}

<#
.SYNOPSIS
Limpia el nombre recibido y limita su largo.
.PARAMETER Value
Nombre enviado por el jugador.
.OUTPUTS
Nombre de hasta 24 caracteres o "Invitado".
#>
function Get-PlayerName($Value) {
  $name = ([string]$Value).Trim()
  if ([string]::IsNullOrWhiteSpace($name)) { return "Invitado" }
  if ($name.Length -gt 24) { return $name.Substring(0, 24) }
  return $name
}

<#
.SYNOPSIS
Busca el tipo de contenido correspondiente a una extensión de archivo.
.PARAMETER Path
Ruta del archivo que se va a servir.
.OUTPUTS
Texto MIME, como text/html o text/css.
#>
function Get-ContentType([string]$Path) {
  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "text/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

<#
.SYNOPSIS
Busca un archivo del sitio y escribe su contenido en la respuesta web.
.PARAMETER Context
Conexión web que solicitó el archivo.
#>
function Send-StaticFile($Context) {
  $relativePath = [Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }
  if ($relativePath.StartsWith("data/", [StringComparison]::OrdinalIgnoreCase)) {
    Send-Json $Context 404 @{ error = "Archivo no encontrado" }
    return
  }

  $filePath = [IO.Path]::GetFullPath((Join-Path $Root $relativePath))
  if (-not $filePath.StartsWith($RootPrefix, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -Path $filePath -PathType Leaf)) {
    Send-Json $Context 404 @{ error = "Archivo no encontrado" }
    return
  }

  $bytes = [IO.File]::ReadAllBytes($filePath)
  $Context.Response.StatusCode = 200
  $Context.Response.ContentType = Get-ContentType $filePath
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

# HttpListener acepta conexiones web sin instalar paquetes extra.
$listener = New-Object Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Club de juegos disponible en http://localhost:$Port/"
Write-Host "API disponible en http://localhost:$Port/api/scores"

try {
  # Sigue esperando solicitudes mientras el servidor esté encendido.
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $method = $context.Request.HttpMethod
      $path = $context.Request.Url.AbsolutePath
      if ($method -eq "GET" -and $path -eq "/api/health") {
        # Esta ruta permite revisar rápidamente que el servidor responda.
        Send-Json $context 200 @{ status = "ok" }
      } elseif ($method -eq "GET" -and $path -eq "/api/scores") {
        # Devuelve el récord, los totales y los historiales de ambos juegos.
        Send-Json $context 200 (Get-Scores)
      } elseif ($method -eq "POST" -and $path -eq "/api/scores/snake") {
        # POST significa que el navegador está enviando un puntaje nuevo.
        $body = Read-JsonBody $context
        $scoreText = [string]$body.score
        if ($scoreText -notmatch '^\d+$' -or [long]$scoreText -gt 1000000000) {
          Send-Json $context 400 @{ error = "El puntaje debe ser un entero no negativo" }
        } else {
          $scores = Get-Scores
          $scores.snake.best = [Math]::Max([int]$scores.snake.best, [int]$scoreText)
          Save-Scores $scores
          Send-Json $context 200 $scores
        }
      } elseif ($method -eq "POST" -and $path -eq "/api/history/snake") {
        # Guarda una partida terminada y conserva solo las 20 más recientes.
        $body = Read-JsonBody $context
        $scoreText = [string]$body.score
        if ($scoreText -notmatch '^\d+$' -or [long]$scoreText -gt 1000000000) {
          Send-Json $context 400 @{ error = "El puntaje debe ser un entero no negativo" }
        } else {
          $scores = Get-Scores
          $scoreValue = [int]$scoreText
          $player = Get-PlayerName $body.player
          $scores.snake.best = [Math]::Max([int]$scores.snake.best, $scoreValue)
          $entry = @{ score = $scoreValue; player = $player; playedAt = [DateTime]::UtcNow.ToString("o") }
          $history = @($entry) + @($scores.snake.history)
          $scores.snake.history = @($history | Select-Object -First 20)
          Save-Scores $scores
          Send-Json $context 200 $scores
        }
      } elseif ($method -eq "POST" -and $path -eq "/api/scores/triqui") {
        # Actualiza el total y agrega una línea al historial de Triqui.
        $body = Read-JsonBody $context
        if ($body.winner -notin @("X", "O", "draw")) {
          Send-Json $context 400 @{ error = "winner debe ser X, O o draw" }
        } else {
          $scores = Get-Scores
          $scores.triqui[$body.winner] += 1
          $player = Get-PlayerName $body.player
          $entry = @{ winner = [string]$body.winner; player = $player; playedAt = [DateTime]::UtcNow.ToString("o") }
          $history = @($entry) + @($scores.triqui.history)
          $scores.triqui.history = @($history | Select-Object -First 20)
          Save-Scores $scores
          Send-Json $context 200 $scores
        }
      } elseif ($method -eq "DELETE" -and $path -eq "/api/scores/triqui") {
        # DELETE reinicia los totales, pero deja guardadas las partidas anteriores.
        $scores = Get-Scores
        $scores.triqui = @{ X = 0; O = 0; draw = 0; history = @($scores.triqui.history) }
        Save-Scores $scores
        Send-Json $context 200 $scores
      } elseif ($method -eq "GET" -or $method -eq "HEAD") {
        # Si no es una ruta API, busca el archivo de la página solicitado.
        Send-StaticFile $context
      } else {
        Send-Json $context 405 @{ error = "Método no permitido" }
      }
    } catch {
      Send-Json $context 500 @{ error = "Error interno del servidor" }
      Write-Warning $_.Exception.Message
    } finally {
      # Cierra esta conexión para liberar sus recursos.
      $context.Response.Close()
    }
  }
} finally {
  # Detiene el servidor cuando se cierra el programa.
  $listener.Stop()
  $listener.Close()
}