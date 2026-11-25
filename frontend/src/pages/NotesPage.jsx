import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import { api } from "../services/api";

export default function NotesPage() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [notaEditando, setNotaEditando] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function cargarNotas() {
    try {
      const datos = await api("/notas");
      setNotas(datos);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarNotas();
  }, []);

  function editarNota(nota) {
    setNotaEditando(nota.id);
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
    setError("");
    setMensaje("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setNotaEditando(null);
    setTitulo("");
    setContenido("");
  }

  async function guardarNota(evento) {
    evento.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    const editando = notaEditando !== null;

    try {
      await api(editando ? `/notas/${notaEditando}` : "/notas", {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify({
          titulo,
          contenido,
        }),
      });

      cancelarEdicion();

      setMensaje(
        editando
          ? "Nota actualizada correctamente"
          : "Nota creada correctamente",
      );

      await cargarNotas();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarNota(id) {
    if (!window.confirm("¿Eliminar esta nota?")) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      await api(`/notas/${id}`, {
        method: "DELETE",
      });

      setMensaje("Nota eliminada correctamente");
      await cargarNotas();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <section className="panel">
          <h1>Mis notas privadas</h1>

          <p>Guardá y administrá tus notas personales.</p>

          <form onSubmit={guardarNota}>
            <h2>{notaEditando ? "Editar nota" : "Nueva nota"}</h2>

            <label>Título</label>

            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={150}
              required
            />

            <label>Contenido</label>

            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              maxLength={10000}
              rows={5}
            />

            <div className="acciones">
              <button type="submit" disabled={cargando}>
                {cargando
                  ? "Guardando..."
                  : notaEditando
                    ? "Actualizar nota"
                    : "Guardar nota"}
              </button>

              {notaEditando && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="exito">{mensaje}</p>}
        </section>

        <section className="notas-section">
          <h2>Notas guardadas ({notas.length})</h2>

          {notas.length === 0 ? (
            <p>No tenés notas registradas.</p>
          ) : (
            <div className="notas-grid">
              {notas.map((nota) => (
                <NoteCard
                  key={nota.id}
                  nota={nota}
                  onEditar={editarNota}
                  onEliminar={eliminarNota}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
