const cors = require("cors");

const origenesPermitidos = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5500",
];

if (process.env.FRONTEND_URL) {
  origenesPermitidos.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

function verificarOrigen(req, res, next) {
  const origen = req.get("Origin");

  if (origen && !origenesPermitidos.includes(origen)) {
    return res.status(403).json({
      error: "Origen no autorizado.",
    });
  }

  next();
}

const configuracionCORS = cors({
  origin(origin, callback) {
    if (!origin || origenesPermitidos.includes(origin)) {
      return callback(null, origin || false);
    }

    callback(null, false);
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "X-CSRF-Token"],

  optionsSuccessStatus: 204,
});

module.exports = {
  verificarOrigen,
  configuracionCORS,
};
