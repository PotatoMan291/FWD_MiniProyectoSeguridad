const pool = require("../config/db");

const { cifrar, descifrar } = require("../services/encryptionService");

function validarNota(titulo, contenido) {
  return (
    typeof titulo === "string" &&
    typeof contenido === "string" &&
    titulo.trim().length > 0 &&
    titulo.trim().length <= 150 &&
    contenido.length <= 10000
  );
}

function validarId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Identificador inválido.",
    });
  }

  req.notaId = id;
  next();
}

function prepararNota(nota) {
  return {
    id: nota.id,
    titulo: nota.titulo,
    contenido: descifrar(nota.contenido_cifrado),
    creado_en: nota.creado_en,
    actualizado_en: nota.actualizado_en,
  };
}

async function listar(req, res, next) {
  try {
    const resultado = await pool.query(
      `SELECT id, titulo, contenido_cifrado,
              creado_en, actualizado_en
       FROM notas
       WHERE usuario_id = $1
       ORDER BY id DESC`,
      [req.session.usuarioId],
    );

    res.json(resultado.rows.map(prepararNota));
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const resultado = await pool.query(
      `SELECT id, titulo, contenido_cifrado,
              creado_en, actualizado_en
       FROM notas
       WHERE id = $1 AND usuario_id = $2`,
      [req.notaId, req.session.usuarioId],
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: "Nota no encontrada.",
      });
    }

    res.json(prepararNota(resultado.rows[0]));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const { titulo, contenido } = req.body;

    if (!validarNota(titulo, contenido)) {
      return res.status(400).json({
        error: "Título o contenido inválido.",
      });
    }

    const contenidoCifrado = cifrar(contenido);

    const resultado = await pool.query(
      `INSERT INTO notas
       (usuario_id, titulo, contenido_cifrado)
       VALUES ($1, $2, $3)
       RETURNING id, titulo, contenido_cifrado,
                 creado_en, actualizado_en`,
      [req.session.usuarioId, titulo.trim(), contenidoCifrado],
    );

    res.status(201).json(prepararNota(resultado.rows[0]));
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const { titulo, contenido } = req.body;

    if (!validarNota(titulo, contenido)) {
      return res.status(400).json({
        error: "Título o contenido inválido.",
      });
    }

    const contenidoCifrado = cifrar(contenido);

    const resultado = await pool.query(
      `UPDATE notas
       SET titulo = $1,
           contenido_cifrado = $2,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $3 AND usuario_id = $4
       RETURNING id, titulo, contenido_cifrado,
                 creado_en, actualizado_en`,
      [titulo.trim(), contenidoCifrado, req.notaId, req.session.usuarioId],
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: "Nota no encontrada.",
      });
    }

    res.json(prepararNota(resultado.rows[0]));
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const resultado = await pool.query(
      `DELETE FROM notas
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [req.notaId, req.session.usuarioId],
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: "Nota no encontrada.",
      });
    }

    res.json({
      mensaje: "Nota eliminada correctamente.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validarId,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};
