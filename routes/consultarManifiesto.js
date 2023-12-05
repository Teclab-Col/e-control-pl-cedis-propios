// usuarioRoutes.js
const express = require("express");
const router = express.Router();
const manifiestosController = require("../controllers/consultarManifiestosController");
const AuthMiddleware = require("../middlewares/authMiddleware");

// Obtener manifiestos por códigos de barras
router.get(
  "/:manifiesto",
  AuthMiddleware.verificarToken,
  manifiestosController.findManifiesto
);

module.exports = router;