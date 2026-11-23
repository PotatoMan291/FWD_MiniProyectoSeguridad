const authSection = document.getElementById("authSection");
const notasSection = document.getElementById("notasSection");
const resultado = document.getElementById("resultado");
const listaNotas = document.getElementById("listaNotas");

let notaEditando = null;

function mensaje(texto, error = false) {
  resultado.textContent = texto;
  resultado.style.color = error ? "#dc2626" : "#15803d";
}

async function obtenerCSRF() {
  const respuesta = await fetch("/api/csrf-token", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error("No fue posible obtener el token CSRF.");
  }

  const datos = await respuesta.json();

  return datos.csrfToken;
}

async function api(ruta, opciones = {}) {
  const metodo = (opciones.method || "GET").toUpperCase();

  const headers = {
    "Content-Type": "application/json",
    ...(opciones.headers || {}),
  };

  // Solicitar token antes de modificar información
  if (!["GET", "HEAD", "OPTIONS"].includes(metodo)) {
    const csrfToken = await obtenerCSRF();

    headers["X-CSRF-Token"] = csrfToken;
  }

  const respuesta = await fetch(ruta, {
    credentials: "same-origin",
    ...opciones,
    headers,
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error en la solicitud.");
  }

  return datos;
}

function mostrarNotas() {
  authSection.classList.add("oculto");
  notasSection.classList.remove("oculto");
}

function mostrarLogin() {
  notasSection.classList.add("oculto");
  authSection.classList.remove("oculto");
  listaNotas.replaceChildren();
}

async function autenticar(registro = false) {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    if (registro) {
      await api("/api/usuarios/registro", {
        method: "POST",
        body: JSON.stringify({ nombre, email, password }),
      });

      mensaje("Usuario registrado. Ahora iniciá sesión.");
      return;
    }

    await api("/api/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    mostrarNotas();
    mensaje("Sesión iniciada correctamente.");
    await cargarNotas();
  } catch (error) {
    mensaje(error.message, true);
  }
}

document.getElementById("authForm").addEventListener("submit", (evento) => {
  evento.preventDefault();
  autenticar(false);
});

document
  .getElementById("btnRegistro")
  .addEventListener("click", () => autenticar(true));

async function cargarNotas() {
  try {
    const notas = await api("/api/notas");
    listaNotas.replaceChildren();

    if (!notas.length) {
      const texto = document.createElement("p");
      texto.textContent = "Todavía no tenés notas.";
      listaNotas.appendChild(texto);
      return;
    }

    notas.forEach((nota) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "nota";

      const titulo = document.createElement("h3");
      titulo.textContent = nota.titulo;

      const contenido = document.createElement("p");
      contenido.textContent = nota.contenido;

      const editar = document.createElement("button");
      editar.textContent = "Editar";
      editar.addEventListener("click", () => {
        notaEditando = nota.id;

        document.getElementById("titulo").value = nota.titulo;
        document.getElementById("contenido").value = nota.contenido;
        document.getElementById("formTitulo").textContent = "Editar nota";

        document.getElementById("btnCancelar").classList.remove("oculto");
      });

      const eliminar = document.createElement("button");
      eliminar.textContent = "Eliminar";
      eliminar.className = "btnEliminar";

      eliminar.addEventListener("click", async () => {
        if (!confirm("¿Eliminar esta nota?")) return;

        try {
          await api(`/api/notas/${nota.id}`, {
            method: "DELETE",
          });

          mensaje("Nota eliminada.");
          await cargarNotas();
        } catch (error) {
          mensaje(error.message, true);
        }
      });

      tarjeta.append(titulo, contenido, editar, eliminar);
      listaNotas.appendChild(tarjeta);
    });
  } catch (error) {
    mensaje(error.message, true);
  }
}

function cancelarEdicion() {
  notaEditando = null;
  document.getElementById("notaForm").reset();

  document.getElementById("formTitulo").textContent = "Nueva nota";

  document.getElementById("btnCancelar").classList.add("oculto");
}

document
  .getElementById("notaForm")
  .addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const contenido = document.getElementById("contenido").value;

    const editando = notaEditando !== null;
    const ruta = editando ? `/api/notas/${notaEditando}` : "/api/notas";

    try {
      await api(ruta, {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify({ titulo, contenido }),
      });

      cancelarEdicion();
      mensaje(editando ? "Nota actualizada." : "Nota creada.");
      await cargarNotas();
    } catch (error) {
      mensaje(error.message, true);
    }
  });

document
  .getElementById("btnCancelar")
  .addEventListener("click", cancelarEdicion);

document.getElementById("btnLogout").addEventListener("click", async () => {
  try {
    await api("/api/usuarios/logout", {
      method: "POST",
    });

    mostrarLogin();
    mensaje("Sesión cerrada.");
  } catch (error) {
    mensaje(error.message, true);
  }
});

// Comprobar si ya existe una sesión activa
(async () => {
  try {
    await api("/api/usuarios/sesion");
    mostrarNotas();
    await cargarNotas();
  } catch {
    mostrarLogin();
  }
})();
