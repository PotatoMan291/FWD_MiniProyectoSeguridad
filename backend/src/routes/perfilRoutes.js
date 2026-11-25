const express = require("express");
const router = express.Router();

const verificarSesion = require("../middlewares/authMiddleware");

const perfil = require("../controllers/perfilController");

router.use(verificarSesion);

router.get("/", perfil.obtenerPerfil);

router.put("/telefono", perfil.actualizarTelefono);

module.exports = router;
