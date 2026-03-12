const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { sspiAuth, verificarUsuarioLocal } = require("../middlewares/auth");

// Pasamos por el saludo de Windows (sspiAuth),
// luego por la limpieza de nombre (verificarUsuarioLocal)
// y finalmente entregamos los datos (obtenerSesion)
router.get(
  "/mi-sesion",
  sspiAuth,
  verificarUsuarioLocal,
  authController.obtenerSesion,
);

module.exports = router;
