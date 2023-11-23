// controllers/AuthController.js
const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authModel');
require('dotenv').config();

const createResponse = (success, data, message = 'Operación exitosa') => ({
  success,
  message,
  data,
});

class AuthController {
  async login(req, res) {
    const { correo, contrasena } = req.body;

    try {
      const usuario = await AuthModel.obtenerPorCredenciales(correo, contrasena);

      if (usuario) {
        const token = jwt.sign({ usuario: usuario.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const responseData = { token };
        res.json(createResponse(true, responseData));
      } else {
        const errorMessage = 'Credenciales inválidas';
        res.status(401).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error en el servidor';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }
}

module.exports = AuthController;