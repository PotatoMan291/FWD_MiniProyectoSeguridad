// Entrada de prueba para el laboratorio local
const payloadSQL = "' OR '1'='1";

const busqueda = document.getElementById("busqueda");

const sqlVulnerable = document.getElementById("sqlVulnerable");

const sqlSeguro = document.getElementById("sqlSeguro");

const resultadoVulnerable = document.getElementById("resultadoVulnerable");

const resultadoSeguro = document.getElementById("resultadoSeguro");

function mostrarResultados(contenedor, datos) {
  contenedor.replaceChildren();

  const total = document.createElement("h3");
  total.textContent = `Registros encontrados: ${datos.total}`;

  contenedor.appendChild(total);

  if (datos.total === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "No se encontraron notas.";
    contenedor.appendChild(mensaje);
    return;
  }

  datos.notas.forEach((nota) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "nota";

    const titulo = document.createElement("h4");
    titulo.textContent = nota.titulo;

    const contenido = document.createElement("p");
    contenido.textContent = nota.contenido;

    tarjeta.append(titulo, contenido);
    contenedor.appendChild(tarjeta);
  });
}

async function consultar(endpoint, sqlElemento, contenedor) {
  try {
    const titulo = encodeURIComponent(busqueda.value);

    const respuesta = await fetch(`/api/demo/${endpoint}?titulo=${titulo}`);

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.error || "Error de consulta.");
    }

    let consulta = datos.consulta;

    if (datos.parametros) {
      consulta += "\n\nParámetros: " + JSON.stringify(datos.parametros);
    }

    sqlElemento.textContent = consulta;

    mostrarResultados(contenedor, datos);
  } catch (error) {
    sqlElemento.textContent = "Error al ejecutar.";
    contenedor.textContent = error.message;
  }
}

async function ejecutarComparacion() {
  await Promise.all([
    consultar("vulnerable", sqlVulnerable, resultadoVulnerable),

    consultar("seguro", sqlSeguro, resultadoSeguro),
  ]);
}

document.getElementById("btnNormal").addEventListener("click", () => {
  busqueda.value = "Proyecto";
  ejecutarComparacion();
});

document.getElementById("btnAtaque").addEventListener("click", () => {
  busqueda.value = payloadSQL;
  ejecutarComparacion();
});

document.getElementById("btnLimpiar").addEventListener("click", () => {
  busqueda.value = "";

  sqlVulnerable.textContent = "Sin ejecutar";
  sqlSeguro.textContent = "Sin ejecutar";

  resultadoVulnerable.textContent = "Pendiente";
  resultadoSeguro.textContent = "Pendiente";
});

// Consulta inicial
ejecutarComparacion();
