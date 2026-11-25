const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { validarPassword } = require("../utils/passwordValidator");

// Hash ficticio para realizar una verificación incluso
// cuando el correo consultado no existe.
const hashFicticio = bcrypt.hash("ContrasenaFicticiaDeLaboratorio2026", 12);

async function registrar(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    if (typeof nombre !== "string" || typeof email !== "string") {
      return res.status(400).json({
        error: "Nombre o correo inválido.",
      });
    }

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim().toLowerCase();

    if (
      nombreLimpio.length < 2 ||
      nombreLimpio.length > 100 ||
      emailLimpio.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)
    ) {
      return res.status(400).json({
        error: "Nombre o correo inválido.",
      });
    }

    const comprobacion = validarPassword(password);

    if (!comprobacion.valida) {
      return res.status(400).json({
        error: comprobacion.error,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios
       (nombre, email, password_hash)
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
        error: "No se pudo registrar esa cuenta.",
      });
    }

    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 150 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        error: "Datos de autenticación inválidos.",
      });
    }

    const resultado = await pool.query(
      `SELECT id, nombre, email, password_hash
       FROM usuarios
       WHERE email = $1`,
      [email.trim().toLowerCase()],
    );

    const usuario = resultado.rows[0];

    // Verificar bcrypt incluso si el usuario no existe.
    const hash = usuario ? usuario.password_hash : await hashFicticio;

    const passwordValida = await bcrypt.compare(password, hash);

    if (!usuario || !passwordValida) {
      return res.status(401).json({
        error: "Credenciales incorrectas.",
      });
    }

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
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({
      error: "No hay sesión activa.",
    });
  }

  return res.json({
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

    return res.json({
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
