const cors = require("cors");

// Orígenes permitidos para la práctica local
const origenesPermitidos = ["http://localhost:3000", "http://localhost:5500"];

// Rechazar peticiones provenientes de orígenes no autorizados
function verificarOrigen(req, res, next) {
  const origen = req.get("Origin");

  if (origen && !origenesPermitidos.includes(origen)) {
    return res.status(403).json({
      error: "Origen no autorizado por SecureNotes.",
    });
  }

  next();
}

// Configuración CORS
const configuracionCORS = cors({
  origin: function (origin, callback) {
    if (!origin || origenesPermitidos.includes(origin)) {
      return callback(null, origin || false);
    }

    return callback(null, false);
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "X-CSRF-Token"],

  credentials: true,

  optionsSuccessStatus: 204,
});

module.exports = {
  verificarOrigen,
  configuracionCORS,
};
