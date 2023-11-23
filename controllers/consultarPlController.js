// controllers/consultaPlController.js
const PlConsultar = require('../models/consultarPl');
const createResponse = (success, data, message = 'Operación exitosa') => ({
  success,
  message,
  data,
});

class ConsultaPlController {
  static async obtenerPlPrimerasCajas(req, res) {
    try {
      const pls = await PlConsultar.findAll({
        attributes: ['id', 'nombre'],
      });
      res.json(createResponse(true, pls));
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al obtener pls';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }
}

module.exports = ConsultaPlController;