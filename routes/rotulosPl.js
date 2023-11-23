// usuarioRoutes.js
const express = require('express');
const router = express.Router();
const RotulosPlController = require('../controllers/rotulosPlController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// Rutas CRUD para rutulos
router.get('/:TB_PEDIDOS_BARCODE_CAJA', AuthMiddleware.verificarToken, RotulosPlController.validarRotulo);

module.exports = router;