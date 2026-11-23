const boton = document.getElementById("btnVerificar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", async () => {
  try {
    const respuesta = await fetch("/api/health");

    if (!respuesta.ok) {
      throw new Error("Error de conexión");
    }

    const datos = await respuesta.json();

    resultado.textContent = `Estado: ${datos.status} - ${datos.servicio}`;

    resultado.style.color = "green";
  } catch (error) {
    resultado.textContent = "No fue posible conectar con la API.";

    resultado.style.color = "red";
  }
});
