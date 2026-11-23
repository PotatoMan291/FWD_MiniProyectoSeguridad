const express = require("express");
const router = express.Router();

const notas = require("../controllers/notasController");
const verificarSesion = require("../middlewares/authMiddleware");

// Todas estas rutas requieren autenticación.
router.use(verificarSesion);

router.get("/", notas.listar);
router.post("/", notas.crear);

router.get("/:id", notas.validarId, notas.obtener);
router.put("/:id", notas.validarId, notas.actualizar);
router.delete("/:id", notas.validarId, notas.eliminar);

module.exports = router;
