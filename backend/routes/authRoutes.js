// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { obtenerSesion } = require("../controllers/authController");

router.get("/mi-sesion", obtenerSesion);

module.exports = router;
