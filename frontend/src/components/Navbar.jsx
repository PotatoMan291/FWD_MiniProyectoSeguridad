import { useNavigate } from "react-router-dom";
import { api, limpiarCSRF } from "../services/api";
import { Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  async function cerrarSesion() {
    try {
      await api("/usuarios/logout", {
        method: "POST",
      });

      limpiarCSRF();
      navigate("/login", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <header className="navbar">
      <h2>SecureNotes</h2>

      <Link to="/perfil" style={{ color: "white", fontWeight: "bold" }}>
        Mi perfil
      </Link>

      <button className="btn-danger" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </header>
  );
}
