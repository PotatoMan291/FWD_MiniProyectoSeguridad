const pool = require("../config/db");

function requiereRol(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const usuarioId = req.session?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          error: "No autenticado.",
        });
      }

      const resultado = await pool.query(
        `SELECT rol
         FROM usuarios
         WHERE id = $1`,
        [usuarioId],
      );

      if (!resultado.rows.length) {
        return res.status(401).json({
          error: "Sesión inválida.",
        });
      }

      const rol = resultado.rows[0].rol;

      if (!rolesPermitidos.includes(rol)) {
        return res.status(403).json({
          error: "Acceso denegado.",
        });
      }

      req.usuarioRol = rol;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = requiereRol;
