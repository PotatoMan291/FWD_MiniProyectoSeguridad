const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function registrar(req, res) {
  try {
    const { nombre, email, password } = req.body;

    if (
      typeof nombre !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios.",
      });
    }

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim().toLowerCase();

    if (
      nombreLimpio.length < 2 ||
      nombreLimpio.length > 100 ||
      emailLimpio.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio) ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        error:
          "Nombre, correo o contraseña inválidos. La contraseña debe tener al menos 8 caracteres.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email`,
      [nombreLimpio, emailLimpio, passwordHash],
    );

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "El correo ya está registrado.",
      });
    }

    console.error("Error al registrar:", error.message);
    return res.status(500).json({
      error: "Error interno del servidor.",
    });
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Correo y contraseña obligatorios.",
      });
    }

    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email.trim().toLowerCase()],
    );

    const usuario = resultado.rows[0];

    const passwordValida = usuario
      ? await bcrypt.compare(password, usuario.password_hash)
      : false;

    if (!usuario || !passwordValida) {
      return res.status(401).json({
        error: "Credenciales incorrectas.",
      });
    }

    // Crear una nueva sesión para evitar fijación de sesión.
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.usuarioId = usuario.id;

      req.session.save((error) => {
        if (error) return next(error);

        return res.json({
          mensaje: "Inicio de sesión exitoso.",
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

function obtenerSesion(req, res) {
  if (!req.session.usuarioId) {
    return res.status(401).json({
      error: "No hay sesión activa.",
    });
  }

  res.json({
    autenticado: true,
    usuarioId: req.session.usuarioId,
  });
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("securenotes.sid", {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    res.json({
      mensaje: "Sesión cerrada correctamente.",
    });
  });
}

module.exports = {
  registrar,
  login,
  obtenerSesion,
  logout,
};
