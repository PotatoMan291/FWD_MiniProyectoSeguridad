import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrar(evento) {
    evento.preventDefault();

    setError("");
    setCargando(true);

    try {
      await api("/usuarios/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre,
          email,
          password,
        }),
      });

      alert("Usuario registrado correctamente");
      navigate("/login");
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
        <h2>Crear cuenta</h2>

        <form onSubmit={registrar}>
          <label>Nombre</label>

          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
          />

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
            minLength={15}
            maxLength={72}
            autoComplete="new-password"
            required
          />

          <p className="ayuda">
            Utilizá una contraseña de al menos 15 caracteres.
          </p>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </main>
  );
}
