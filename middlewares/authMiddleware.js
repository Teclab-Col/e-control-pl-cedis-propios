// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = {
  verificarToken: (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado. Por favor, incluye un token JWT en la cabecera Authorization.' });
    }

    try {
      // Extraer el token sin el prefijo 'Bearer'
      const tokenWithoutBearer = token.replace('Bearer ', '').trim();
      // Decodificar el token utilizando la clave secreta
      const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

      // Agregar información sobre el usuario decodificado al objeto de solicitud
      req.usuario = decoded.usuario;

      // Imprimir información para depuración
      console.log('Token decodificado:', decoded);

      // Continuar con la siguiente función middleware
      next();
    } catch (error) {
      // Imprimir información para depuración
      console.error('Error al verificar el token:', error.message);

      // Manejar errores específicos, por ejemplo, token expirado
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ mensaje: 'Token expirado' });
      }

      // Manejar otros errores
      return res.status(401).json({ mensaje: 'Token no válido' });
    }
  },

  // Nueva función para generar un token con más tiempo de expiración
  generarTokenConMasTiempo: (usuario) => {
    const token = jwt.sign(
      { usuario },
      process.env.JWT_SECRET,
      { expiresIn: '8d' } // Por ejemplo, aquí el token expirará en 7 días
    );

    return token;
  },
};

module.exports = authMiddleware;