import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotesPage from "../pages/NotesPage";

import { api } from "../services/api";

function ProtectedRoute() {
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    let activo = true;

    api("/usuarios/sesion")
      .then(() => {
        if (activo) setEstado("autenticado");
      })
      .catch(() => {
        if (activo) setEstado("no-autenticado");
      });

    return () => {
      activo = false;
    };
  }, []);

  if (estado === "cargando") {
    return (
      <main className="auth-container">
        <p>Verificando sesión...</p>
      </main>
    );
  }

  if (estado === "no-autenticado") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/notas" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/notas" element={<NotesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
