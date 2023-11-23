// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middlewares/authMiddleware');

const authController = new AuthController();

// Ruta para iniciar sesión y obtener un token
router.post('/login', (req, res) => authController.login(req, res));

// Ruta protegida que requiere un token válido
router.get('/recurso-protegido', AuthMiddleware.verificarToken, (req, res) => {
  res.json({ mensaje: 'Este es un recurso protegido' });
});

module.exports = router;