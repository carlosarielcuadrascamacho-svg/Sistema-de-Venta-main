const express = require("express");
const router = express.Router();
// Importa tus funciones del controlador (asegúrate de que los nombres coincidan con tu archivo real)
const {
  ventasPorDia,productosMasVendidos,
} = require("../controllers/reporteController");
const { verificarUsuarioLocal, verificarRol } = require("../middlewares/auth");

// Todas las rutas de reportes requieren estar logueado
router.use(verificarUsuarioLocal);

// Agregamos "Cajero" al arreglo de roles permitidos para que el backend los deje pasar
router.get(
  "/ventas",
  verificarRol(["Administrador", "Cajero"]),
  ventasPorDia,
);
router.get(
  "/top-productos",
  verificarRol(["Administrador", "Cajero"]),
  productosMasVendidos,
);

module.exports = router;
