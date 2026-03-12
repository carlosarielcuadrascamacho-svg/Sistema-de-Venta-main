exports.obtenerSesion = (req, res) => {
  // Si el código llegó aquí, es porque verificarUsuarioLocal funcionó
  // y el usuario coincide con tu base de datos.
  res.json({
    mensaje: "Sesión activa y validada",
    usuario: req.user,
    rol: req.user.rol,
  });
};
