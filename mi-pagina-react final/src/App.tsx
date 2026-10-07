import { useState } from "react";
import "./App.css";

type Turno = {
  id: string;
  nombre: string;
  motivo: string;
};

const turnosIniciales: Turno[] = [
  {
    id: "t-1",
    nombre: "Lina",
    motivo: "Pregunta sobre React",
  },
  {
    id: "t-2",
    nombre: "Tomás",
    motivo: "Error de instalación",
  },
];

function App() {
  const [turnos, setTurnos] = useState<Turno[]>(turnosIniciales);
  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");

  function agregarTurno() {
    const nombreLimpio = nombre.trim();
    const motivoLimpio = motivo.trim();

    if (!nombreLimpio || !motivoLimpio) {
      return;
    }

    const nuevoTurno: Turno = {
      id: crypto.randomUUID(),
      nombre: nombreLimpio,
      motivo: motivoLimpio,
    };

    setTurnos((filaActual) => [...filaActual, nuevoTurno]);
    setNombre("");
    setMotivo("");
  }

  function atenderSiguiente() {
    setTurnos((filaActual) => filaActual.slice(1));
  }

  const siguienteTurno = turnos[0];

  return (
    <main>
      <h1>Fila creativa</h1>

      <label>
        Nombre
        <input
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
        />
      </label>

      <label>
        Motivo
        <input
          value={motivo}
          onChange={(evento) => setMotivo(evento.target.value)}
        />
      </label>

      <button onClick={agregarTurno}>Agregar turno</button>

      {siguienteTurno ? (
        <section>
          <h2>Siguiente: {siguienteTurno.nombre}</h2>
          <p>{siguienteTurno.motivo}</p>

          <button onClick={atenderSiguiente}>
            Atender siguiente
          </button>
        </section>
      ) : (
        <p>No hay personas en espera.</p>
      )}

      <h2>En espera</h2>

      <ol>
        {turnos.map((turno) => (
          <li key={turno.id}>
            {turno.nombre} - {turno.motivo}
          </li>
        ))}
      </ol>
    </main>
  );
}

export default App;