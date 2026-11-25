const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const requiereRol = require("../middlewares/roleMiddleware");

// Todas las rutas requieren rol administrador
router.use(requiereRol("admin"));

router.get("/usuarios", async (req, res, next) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, email, rol, creado_en
       FROM usuarios
       ORDER BY id`,
    );

    res.json(resultado.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
