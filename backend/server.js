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

// Conexión a MongoDB
connectDB();

// 1. Middlewares Globales
// CORRECCIÓN CORS: Para SSPI, es mejor especificar una función dinámica o permitir el origen real
// y es OBLIGATORIO habilitar `credentials: true`.
app.use(
  cors({
    origin: function (origin, callback) {
      // Permite el mismo origen (cuando origin es undefined) o cualquier red local
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // <-- CRÍTICO PARA QUE EL NAVEGADOR ENVÍE EL TICKET DE WINDOWS
  })
);

app.use(express.json());
app.use(morgan("dev"));

// 2. Archivos Estáticos
app.use("/public", express.static(path.join(__dirname, "public")));
const frontendPath = path.join(__dirname, "../frontend");
console.log("[Static] Servir frontend desde:", frontendPath);
app.use(express.static(frontendPath));

// Log simple de peticiones
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// 3. Rutas Públicas (SIN AUTENTICACIÓN)
// CORRECCIÓN: Movida aquí arriba para que no pida credenciales de Windows
app.get("/api/health", (req, res) => {
  res.status(200).json({
    estado: "OK",
    mensaje: "Servidor POS funcionando en red local",
  });
});

// 4. Protección Global SSPI
// Atrapa TODO lo que vaya a `/api` (excepto health que ya se procesó arriba)
app.use("/api", autenticacionWindows, verificarUsuarioLocal);

// 5. Importar y Usar Rutas Protegidas
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

// Fallback 404
app.use((req, res) => {
  console.log(`[404] Recurso no encontrado: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Not found: ${req.originalUrl}`);
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Servidor] Ejecutándose en puerto ${PORT}`);
  console.log(`[Red Local] Acceso web: http://${process.env.SERVER_HOSTNAME || 'localhost'}:${PORT}`);
});