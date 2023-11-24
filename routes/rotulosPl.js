// usuarioRoutes.js
const express = require("express");
const router = express.Router();
const RotulosPlController = require("../controllers/rotulosPlController");
const AuthMiddleware = require("../middlewares/authMiddleware");

// Rutas CRUD para rutulos
router.get(
  "/:codeSession", //"/manifiestos/:codeSession",
  AuthMiddleware.verificarToken,
  RotulosPlController.obtenerManifiestos
);

router.get(
  "/:codigoDeBarras/:codeSession", //"/rotulos/:codigoDeBarras/:codeSession",
  AuthMiddleware.verificarToken,
  RotulosPlController.validarRotulo
);

module.exports = router;
