const { sso } = require("node-expose-sspi");
const Usuario = require("../models/Usuario");

// Middleware nativo para forzar autenticación de Windows
const sspiAuth = sso.auth();

// Middleware nuestro para verificar que el usuario exista en MongoDB
const verificarUsuarioLocal = async (req, res, next) => {
  try {
    // 1. Validar que SSPI haya detectado la sesión de Windows
    if (!req.sspi || !req.sspi.user) {
      return res.status(401).json({ error: "No autenticado en Windows" });
    }

    // 2. Extraer el usuario (Viene como "DESKTOP-TCBRH6I\Carlos")
    const windowsUserFull = req.sspi.user.name;

    // 3. Limpiarlo: cortamos por la "\" y tomamos la última parte en minúsculas -> "carlos"
    const partes = windowsUserFull.split("\\");
    const usernameLimpio = partes[partes.length - 1].toLowerCase();

    // 4. Buscarlo en nuestra base de datos de Mongo
    const usuarioDB = await Usuario.findOne({ username: usernameLimpio });

    if (!usuarioDB) {
      console.log(
        `[SSO Bloqueado] Windows dio: ${windowsUserFull} | Buscado como: ${usernameLimpio}`,
      );
      return res
        .status(403)
        .json({ error: "Tu usuario de Windows no está registrado en el POS." });
    }

    // 5. Si existe, guardamos sus datos para pasarlos al siguiente paso
    req.user = usuarioDB;
    next();
  } catch (error) {
    console.error("Error en verificación de Windows:", error);
    res.status(500).json({ error: "Error interno al validar sesión" });
  }
};

const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ error: "Acceso denegado. Rol insuficiente." });
    }
    next();
  };
};

module.exports = { sspiAuth, verificarUsuarioLocal, verificarRol };
