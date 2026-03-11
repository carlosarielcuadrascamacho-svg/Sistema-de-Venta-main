// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/database.js");

const app = express();

const {
  autenticacionWindows,
  verificarUsuarioLocal,
} = require("./middlewares/auth");

connectDB();

// Configuración ESTRICTA de CORS (Requisito de los navegadores para SSO/SSPI)
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // <-- CRÍTICO para recibir el ticket de Windows
  })
);

app.use(express.json());

// Archivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")));
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

app.use(morgan("dev"));

// -----------------------------------------------------
// Rutas Públicas (Sin SSO)
// -----------------------------------------------------
app.get("/api/health", (req, res) => {
  res.status(200).json({ estado: "OK", mensaje: "Servidor POS funcionando" });
});

// -----------------------------------------------------
// Protección Global SSO: Todo lo que vaya a /api será autenticado
// -----------------------------------------------------
app.use("/api", autenticacionWindows, verificarUsuarioLocal);

// Importar y Usar Rutas Protegidas
const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const empleadoRoutes = require("./routes/empleadoRoutes");
const nominaRoutes = require("./routes/nominaRoutes");
const ventaRoutes = require("./routes/ventaRoutes");
const reporteRoutes = require("./routes/reporteRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/nomina", nominaRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/reportes", reporteRoutes);

app.use((req, res) => {
  res.status(404).send(`Recurso no encontrado: ${req.originalUrl}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Servidor] Ejecutándose en puerto ${PORT}`);
  console.log(`[Red Local] Acceso web: http://${process.env.SERVER_HOSTNAME || 'localhost'}:${PORT}`);
});