// usuarioRoutes.js
const express = require("express");
const router = express.Router();
const RotulosPlController = require("../controllers/rotulosPlController");
const AuthMiddleware = require("../middlewares/authMiddleware");

// Obtener manifiestos por codigos de barras
router.get(
  "/:codigoDeBarras/:codeSession", //"/rotulos/:codigoDeBarras/:codeSession",
  AuthMiddleware.verificarToken,
  RotulosPlController.validarRotulo
);

// Obtener manifiestos con el codeSession
router.get(
  "/:codeSession", //"/manifiestos/:codeSession",
  AuthMiddleware.verificarToken,
  RotulosPlController.obtenerManifiestos
);

module.exports = router;
