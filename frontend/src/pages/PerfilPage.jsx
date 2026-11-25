import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargarPerfil() {
    try {
      const datos = await api("/perfil");
      setPerfil(datos);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function guardarTelefono(evento) {
    evento.preventDefault();

    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const datos = await api("/perfil/telefono", {
        method: "PUT",
        body: JSON.stringify({ telefono }),
      });

      setMensaje(datos.mensaje);
      setTelefono("");
      await cargarPerfil();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <section className="panel">
          <Link to="/notas">Volver a mis notas</Link>

          <h1>Mi perfil seguro</h1>

          {perfil && (
            <div>
              <p>
                <strong>Nombre:</strong> {perfil.nombre}
              </p>
              <p>
                <strong>Correo:</strong> {perfil.email}
              </p>
              <p>
                <strong>Rol:</strong> {perfil.rol}
              </p>
              <p>
                <strong>Teléfono:</strong> {perfil.telefono || "No registrado"}
              </p>
            </div>
          )}

          <h2>Actualizar teléfono</h2>

          <form onSubmit={guardarTelefono}>
            <label htmlFor="telefono">Número telefónico</label>

            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="8888-8888"
              maxLength={20}
              required
            />

            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar teléfono"}
            </button>
          </form>

          {mensaje && <p className="exito">{mensaje}</p>}
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    </>
  );
}
