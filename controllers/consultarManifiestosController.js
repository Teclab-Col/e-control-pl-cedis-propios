const consultarManifiestoModel = require('../models/consultarManifiestosModel');
const createResponse = (success, data, message = 'Operación exitosa') => ({
  success,
  message,
  data,
});

class ManifiestosController {
  static async findManifiesto(req, res) {
    const manifiestoReq = req.params.manifiesto.split("=")[1];
    try {
      const resultadosManifiesto = await consultarManifiestoModel.findManifiestoByPkAndInsert(manifiestoReq);

      if (resultadosManifiesto) {
        res.json(createResponse(true, resultadosManifiesto));
      } else {
        const errorMessage = `Manifiesto ${manifiestoReq} no encontrado`;
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = "Error al obtener o insertar información del manifiesto";
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }
}

module.exports = ManifiestosController;