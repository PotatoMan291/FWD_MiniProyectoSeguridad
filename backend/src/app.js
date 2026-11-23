require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const path = require("path");

const pool = require("./config/db");

const usuariosRoutes = require("./routes/usuariosRoutes");
const notasRoutes = require("./routes/notasRoutes");

const { verificarOrigen, configuracionCORS } = require("./config/corsConfig");

const {
  entregarTokenCSRF,
  verificarCSRF,
} = require("./middlewares/csrfMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// 1. VERIFICAR CONFIGURACIÓN
// =====================================

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET debe tener al menos 32 caracteres.");
}

// =====================================
// 2. ENCABEZADOS DE SEGURIDAD Y CSP
// =====================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);

// =====================================
// 3. CONFIGURAR CORS
// =====================================

// Verificar origen antes de permitir acceso a la API
app.use("/api", verificarOrigen);

// Aplicar configuración CORS
app.use("/api", configuracionCORS);

// =====================================
// 4. PROCESAMIENTO DE DATOS
// =====================================

app.use(
  express.json({
    limit: "20kb",
  }),
);

// =====================================
// 5. SESIONES Y COOKIES
// =====================================

app.use(
  session({
    name: "securenotes.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 60 * 60 * 1000,
    },
  }),
);

// =====================================
// 6. PROTECCIÓN CONTRA FUERZA BRUTA
// =====================================

const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    error: "Demasiados intentos. Intentá más tarde.",
  },
});

// =====================================
// 7. RUTA DE ESTADO
// =====================================

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "OK",
      servicio: "SecureNotes API",
      database: "Conectada",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      database: "Sin conexión",
    });
  }
});

// =====================================
// 8. PROTECCIÓN CSRF
// =====================================

// Obtener el token de la sesión
app.get("/api/csrf-token", entregarTokenCSRF);

// Todas las operaciones de escritura requieren token
app.use("/api", verificarCSRF);

// =====================================
// 9. RUTAS DE USUARIOS
// =====================================

// Limitar los intentos de login y registro
app.use(
  "/api/usuarios",
  (req, res, next) => {
    if (req.method === "POST" && ["/login", "/registro"].includes(req.path)) {
      return limiteAuth(req, res, next);
    }

    next();
  },
  usuariosRoutes,
);

// =====================================
// 10. RUTAS DE NOTAS
// =====================================

app.use("/api/notas", notasRoutes);

// =====================================
// 11. FRONTEND
// =====================================

app.use(express.static(path.join(__dirname, "../../frontend")));

// =====================================
// 12. ERRORES
// =====================================

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(500).json({
    error: "Error interno del servidor.",
  });
});

// =====================================
// 13. INICIAR SERVIDOR
// =====================================

app.listen(PORT, () => {
  console.log(`SecureNotes ejecutándose en http://localhost:${PORT}`);

  console.log("Protecciones activadas:");
  console.log("- SQL Injection: consultas parametrizadas");
  console.log("- XSS: textContent y CSP");
  console.log("- CSRF: tokens por sesión");
  console.log("- CORS: orígenes restringidos");
});
