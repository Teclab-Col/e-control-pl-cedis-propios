// controllers/usuarioController.js
const Usuario = require('../models/usuarioModel');
const createResponse = (success, data, message = 'Operación exitosa') => ({
  success,
  message,
  data,
});
const multer = require('multer');

// Configura multer
const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

class UsuarioController {
  static async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nombre'],
      });
      res.json(createResponse(true, usuarios));
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al obtener usuarios';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }

  static async obtenerUsuarioPorId(req, res) {
    const usuarioId = req.params.id;
    try {
      const usuario = await Usuario.findByPk(usuarioId);
      if (usuario) {
        res.json(createResponse(true, usuario));
      } else {
        const errorMessage = 'Usuario no encontrado';
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al obtener usuario por ID';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }

  static async crearUsuario(req, res) {
    const { nombre, correo, contrasena } = req.body;
    const archivo = req.file; // Accede al archivo enviado

    try {
      const nuevoUsuario = await Usuario.create({ nombre, correo, contrasena });
      res.status(201).json(createResponse(true, nuevoUsuario));
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al crear usuario';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }

  static async actualizarUsuario(req, res) {
    const usuarioId = req.params.id;
    const { nombre, correo, contrasena } = req.body;
    
    // Accede al archivo enviado
    const archivo = req.file;
  
    try {
      const usuario = await Usuario.findByPk(usuarioId);
      if (usuario) {
        // Aquí puedes usar el archivo y los datos del cuerpo según sea necesario
        await Usuario.update(usuarioId, { nombre, correo, contrasena });
  
        res.json(createResponse(true, usuario));
      } else {
        const errorMessage = 'Usuario no encontrado';
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al actualizar usuario';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }
  
  


  static async eliminarUsuario(req, res) {
    const usuarioId = req.params.id;
    try {
      const usuario = await Usuario.findByPk(usuarioId);
      if (usuario) {
        await usuario.destroy();
        const successMessage = 'Usuario eliminado correctamente';
        res.json(createResponse(true, { mensaje: successMessage }));
      } else {
        const errorMessage = 'Usuario no encontrado';
        res.status(404).json(createResponse(false, null, errorMessage));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = 'Error al eliminar usuario';
      res.status(500).json(createResponse(false, null, errorMessage));
    }
  }
}

module.exports = UsuarioController;