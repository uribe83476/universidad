import { useState, type FormEvent } from 'react'
import './App.css'

type Turn = {
  id: number
  name: string
  reason: string
}

function App() {
  const [queue, setQueue] = useState<Turn[]>([])
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [nextId, setNextId] = useState(1)
  const [message, setMessage] = useState('')

  function addTurn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedReason = reason.trim()

    if (!trimmedName || !trimmedReason) {
      setMessage('Completa el nombre y el motivo para agregar un turno.')
      return
    }

    setQueue((turns) => [
      ...turns,
      { id: nextId, name: trimmedName, reason: trimmedReason },
    ])
    setNextId((id) => id + 1)
    setName('')
    setReason('')
    setMessage(`Turno de ${trimmedName} agregado al final de la fila.`)
  }

  function serveNextTurn() {
    if (queue.length === 0) {
      setMessage('La fila está vacía. No hay personas por atender.')
      return
    }

    const [servedTurn, ...remainingTurns] = queue
    setQueue(remainingTurns)
    setMessage(`Turno de ${servedTurn.name} atendido.`)
  }

  const nextTurn = queue[0]

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">Atención al público</span>
        <h1>Fila de turnos</h1>
        <p>Organiza la atención de forma sencilla y en orden de llegada.</p>
      </header>

      <div className="queue-layout">
        <section className="panel form-panel" aria-labelledby="add-heading">
          <div className="section-heading">
            <span className="step-number">01</span>
            <div>
              <h2 id="add-heading">Agregar a la fila</h2>
              <p>Ingresa los datos de la persona.</p>
            </div>
          </div>

          <form className="turn-form" onSubmit={addTurn}>
            <label htmlFor="turn-name">Nombre</label>
            <input
              id="turn-name"
              name="name"
              type="text"
              placeholder="Ej. Ana García"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="turn-reason">Motivo de consulta</label>
            <input
              id="turn-reason"
              name="reason"
              type="text"
              placeholder="Ej. Consulta general"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />

            <button className="button button-primary" type="submit">
              <span aria-hidden="true">＋</span> Agregar turno
            </button>
          </form>
        </section>

        <section className="panel queue-panel" aria-labelledby="queue-heading">
          <div className="queue-topline">
            <div className="section-heading">
              <span className="step-number">02</span>
              <div>
                <h2 id="queue-heading">En espera</h2>
                <p>
                  {queue.length === 1
                    ? '1 persona en la fila'
                    : `${queue.length} personas en la fila`}
                </p>
              </div>
            </div>
            <span className="queue-count" aria-label={`${queue.length} turnos`}>
              {String(queue.length).padStart(2, '0')}
            </span>
          </div>

          <div className="next-turn">
            <span className="next-label">SIGUIENTE</span>
            {nextTurn ? (
              <>
                <h3>{nextTurn.name}</h3>
                <p>{nextTurn.reason}</p>
              </>
            ) : (
              <>
                <h3>La fila está vacía</h3>
                <p>Cuando agregues a alguien, su turno aparecerá aquí.</p>
              </>
            )}
          </div>

          <div className="queue-list-heading">
            <h3>Personas en la fila</h3>
            <span>En orden de llegada</span>
          </div>

          {queue.length > 0 ? (
            <ol className="turn-list">
              {queue.map((turn, index) => (
                <li className="turn-item" key={turn.id}>
                  <span className="turn-position">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="turn-details">
                    <strong>{turn.name}</strong>
                    <span>{turn.reason}</span>
                  </div>
                  {index === 0 && <span className="waiting-badge">Siguiente</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-list">Todavía no hay turnos registrados.</p>
          )}

          <button
            className="button button-secondary"
            type="button"
            onClick={serveNextTurn}
          >
            Atender siguiente <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>

      <p className="status-message" role="status" aria-live="polite">
        {message}
      </p>
    </main>
  )
}

export default App
