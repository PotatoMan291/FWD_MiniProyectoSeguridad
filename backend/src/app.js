require("dotenv").config();

const express = require("express");
const helmet = require("helmet");

const app = express();

const PORT = process.env.PORT || 3000;

// Seguridad básica mediante encabezados HTTP
app.use(helmet());

// Permitir recibir datos JSON
app.use(express.json());

const path = require("path");

// Servir los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Ruta de comprobación de la API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    servicio: "SecureNotes API",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`SecureNotes ejecutándose en http://localhost:${PORT}`);
});
