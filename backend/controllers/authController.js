// backend/controllers/authController.js
const jwt = require('jsonwebtoken');

// Controlador para inicio de sesión SSO (Single Sign-On)
const loginSSO = async (req, res) => {
    try {
        // En este punto, los middlewares (autenticacionWindows y verificarUsuarioLocal)
        // ya validaron la sesión de Windows y encontraron al usuario en MongoDB.
        // Los datos del usuario están en req.usuario.

        const usuario = req.usuario;

        // Generar el JWT
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // El token caduca en 8 horas (una jornada laboral)
        );

        res.json({
            mensaje: 'Login SSO exitoso',
            token,
            usuario: {
                nombre: usuario.nombre,
                rol: usuario.rol,
                username: usuario.username
            }
        });

    } catch (error) {
        console.error("Error en loginSSO:", error);
        res.status(500).json({ error: 'Error en el servidor durante la generación del token SSO.' });
    }
};

module.exports = { loginSSO };