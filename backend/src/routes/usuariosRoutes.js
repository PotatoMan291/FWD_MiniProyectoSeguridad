const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuariosController");

router.post("/registro", usuariosController.registrar);
router.post("/login", usuariosController.login);
router.get("/sesion", usuariosController.obtenerSesion);
router.post("/logout", usuariosController.logout);

module.exports = router;
