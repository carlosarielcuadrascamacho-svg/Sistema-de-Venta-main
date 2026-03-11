// backend/controllers/authController.js

const obtenerSesion = (req, res) => {
    // Si llega aquí, los middlewares ya hicieron todo el trabajo pesado.
    // req.usuario contiene los datos cruzados entre Windows y MongoDB.
    res.json(req.usuario);
};

module.exports = { obtenerSesion };