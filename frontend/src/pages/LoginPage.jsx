import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, limpiarCSRF } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setError("");
    setCargando(true);

    try {
      await api("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // El login regenera la sesión en el servidor
      limpiarCSRF();

      navigate("/notas", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1>SecureNotes</h1>
        <h2>Iniciar sesión</h2>

        <form onSubmit={iniciarSesion}>
          <label>Correo electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p>
          ¿No tenés cuenta? <Link to="/registro">Registrate aquí</Link>
        </p>
      </div>
    </main>
  );
}
