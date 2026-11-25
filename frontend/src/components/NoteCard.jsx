export default function NoteCard({ nota, onEditar, onEliminar }) {
  return (
    <article className="nota-card">
      <h3>{nota.titulo}</h3>

      <p>{nota.contenido}</p>

      <div className="acciones">
        <button onClick={() => onEditar(nota)}>Editar</button>

        <button className="btn-danger" onClick={() => onEliminar(nota.id)}>
          Eliminar
        </button>
      </div>
    </article>
  );
}
