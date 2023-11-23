// usuarioRoutes.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configura multer
const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

// Rutas CRUD para usuarios
router.get('/', AuthMiddleware.verificarToken, UsuarioController.obtenerUsuarios);
router.get('/:id', AuthMiddleware.verificarToken, UsuarioController.obtenerUsuarioPorId);
router.post('/', AuthMiddleware.verificarToken, upload.single('archivo'), UsuarioController.crearUsuario);
router.put('/:id', AuthMiddleware.verificarToken, upload.single('archivo'), UsuarioController.actualizarUsuario);
router.delete('/:id', AuthMiddleware.verificarToken, UsuarioController.eliminarUsuario);

module.exports = router;