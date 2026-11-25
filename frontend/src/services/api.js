let csrfToken = null;

async function obtenerCSRF() {
  const respuesta = await fetch("/api/csrf-token", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error("No fue posible obtener el token CSRF");
  }

  const datos = await respuesta.json();

  csrfToken = datos.csrfToken;
  return csrfToken;
}

export function limpiarCSRF() {
  csrfToken = null;
}

export async function api(ruta, opciones = {}) {
  const metodo = (opciones.method || "GET").toUpperCase();

  const headers = {
    ...(opciones.headers || {}),
  };

  if (opciones.body) {
    headers["Content-Type"] = "application/json";
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(metodo)) {
    // Obtener un token válido para la sesión actual
    const token = await obtenerCSRF();
    headers["X-CSRF-Token"] = token;
  }

  const respuesta = await fetch(`/api${ruta}`, {
    ...opciones,
    method: metodo,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.error || `Error HTTP ${respuesta.status}`);
  }

  return datos;
}
