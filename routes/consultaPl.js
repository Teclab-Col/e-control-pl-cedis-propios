// usuarioRoutes.js
const express = require('express');
const router = express.Router();
const ConsultaPlController = require('../controllers/consultarPlController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configura multer
const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

// Rutas CRUD para usuarios
router.get('/', AuthMiddleware.verificarToken, ConsultaPlController.obtenerPlPrimerasCajas);

module.exports = router;