// backend/middlewares/auth.js
const { sso } = require("node-expose-sspi");
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

// 1. Middleware que le pide al navegador las credenciales de Windows vía SSPI
const autenticacionWindows = sso.auth();

// 2. Middleware que verifica el rol en MongoDB basado en el usuario de Windows
const verificarUsuarioLocal = async (req, res, next) => {
  // node-expose-sspi inyecta el objeto sso en la request
  if (!req.sso || !req.sso.user || !req.sso.user.name) {
    return res
      .status(401)
      .json({ error: "No se detectó una sesión activa de Windows." });
  }

  // Extraemos el nombre de usuario (usualmente viene como DOMINIO\usuario)
  // Nos quedamos solo con el nombre de usuario y lo pasamos a minúsculas
  let usernameWindows = req.sso.user.name.toLowerCase();
  if (usernameWindows.includes("\\")) {
    usernameWindows = usernameWindows.split("\\")[1];
  }

  try {
    // Buscamos si ese usuario de Windows tiene permisos en nuestro sistema
    const usuarioDB = await Usuario.findOne({ username: usernameWindows });

    if (!usuarioDB) {
      return res
        .status(403)
        .json({
          error: `Acceso denegado: El usuario de Windows '${usernameWindows}' no está registrado en el POS.`,
        });
    }

    // Si existe, lo guardamos en la request para que los controladores lo usen
    req.usuario = {
      id: usuarioDB._id,
      nombre: usuarioDB.nombre,
      username: usernameWindows,
      rol: usuarioDB.rol,
    };

    next();
  } catch (error) {
    console.error("Error en verificarUsuarioLocal:", error);
    res
      .status(500)
      .json({ error: "Error interno al verificar el usuario de Windows." });
  }
};

// 3. El mismo verificador de roles que ya teníamos
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({
          error:
            "Acceso denegado. Tu rol de Windows no tiene permisos para realizar esta acción.",
        });
    }
    next();
  };
};

module.exports = { autenticacionWindows, verificarUsuarioLocal, verificarRol };
