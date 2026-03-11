// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginSSO } = require('../controllers/authController');

// Ruta para el Single Sign-On. 
// Como pasa por los middlewares globales en server.js, la autenticación IWA ya ocurrió.
router.get('/sso-login', loginSSO);

router.get('/mi-sesion', (req, res) => {
    res.json(req.usuario);
});

module.exports = router;