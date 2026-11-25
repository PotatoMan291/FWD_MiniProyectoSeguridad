const pool = require("../config/db");

const { cifrar, descifrar } = require("../services/encryptionService");

function enmascararTelefono(telefono) {
  const digitos = telefono.replace(/\D/g, "");

  return "****-****-" + digitos.slice(-4);
}

async function obtenerPerfil(req, res, next) {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, email, rol, telefono_cifrado
       FROM usuarios
       WHERE id = $1`,
      [req.session.usuarioId],
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: "Usuario no encontrado.",
      });
    }

    const usuario = resultado.rows[0];

    const telefono = usuario.telefono_cifrado
      ? descifrar(usuario.telefono_cifrado)
      : null;

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      telefono: telefono ? enmascararTelefono(telefono) : null,
    });
  } catch (error) {
    next(error);
  }
}

async function actualizarTelefono(req, res, next) {
  try {
    const { telefono } = req.body;

    if (
      typeof telefono !== "string" ||
      !/^\+?[0-9 -]{8,20}$/.test(telefono) ||
      telefono.replace(/\D/g, "").length < 8 ||
      telefono.replace(/\D/g, "").length > 15
    ) {
      return res.status(400).json({
        error: "Número telefónico inválido.",
      });
    }

    const telefonoNormalizado = telefono.replace(/[\s-]/g, "");

    const telefonoCifrado = cifrar(telefonoNormalizado);

    await pool.query(
      `UPDATE usuarios
       SET telefono_cifrado = $1
       WHERE id = $2`,
      [telefonoCifrado, req.session.usuarioId],
    );

    res.json({
      mensaje: "Teléfono actualizado correctamente.",
      telefono: enmascararTelefono(telefonoNormalizado),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerPerfil,
  actualizarTelefono,
};
