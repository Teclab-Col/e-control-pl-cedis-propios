// controllers/rotulosPlController.js
const RotulosPlModel = require("../models/rotulosPlModel");
const createResponse = (success, data, message = "Operación exitosa") => ({
  success,
  message,
  data,
});
const multer = require("multer");

// Configura multer
const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

class RotulosPlController {
  static async validarRotulo(req, res) {
    const codigoDeBarrasReq = req.params.codigoDeBarras.split("=")[1];
    const codeSession = req.params.codeSession.split("=")[1];
    try {
      const rotuloPl = await RotulosPlModel.findByPk(
        codigoDeBarrasReq,
        codeSession
      );
      if (rotuloPl) {
        res.json(createResponse(true, rotuloPl));
      } else {
        const errorMessage = "Rotulo " + codigoDeBarrasReq + " no encontrado ";
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = "Error al obtener Rotulo por codigo de barras ";
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }

  static async obtenerManifiestos(req, res) {
    const codeSession = req.params.codeSession.split("=")[1];
    try {
      const manifiestosCodeSession = await RotulosPlModel.findByCodeSession(
        codeSession
      );
      if (manifiestosCodeSession) {
        res.json(createResponse(true, manifiestosCodeSession));
      } else {
        const errorMessage =
          "Manifiestos no encontrados por CodeSession : " + codeSession;
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = "Error al obtener Rotulo por CodeSession ";
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }
}

module.exports = RotulosPlController;
