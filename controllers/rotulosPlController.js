// controllers/rotulosPlController.js
const RotulosPlModel = require('../models/rotulosPlModel');
const createResponse = (success, data, message = 'Operación exitosa') => ({
  success,
  message,
  data,
});
const multer = require('multer');

// Configura multer
const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

class RotulosPlController {

  static async validarRotulo(req, res) {
    const codigoDeBarrasReq = req.params.TB_PEDIDOS_BARCODE_CAJA.split('=')[1];
    try {
      const rotuloPl = await RotulosPlModel.findByPk(codigoDeBarrasReq);
      if (rotuloPl) {
        res.json(createResponse(true, rotuloPl));
      } else {
        const errorMessage = 'Rotulo no encontrado' + codigoDeBarrasReq;
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al obtener Rotulo por codigo de barras';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }

}

module.exports = RotulosPlController;