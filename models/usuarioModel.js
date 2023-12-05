// usuarioModel.js
const { pool1 } = require('../config/db');

class Usuario {
  static async create(usuario) {
    const { nombre, correo, contrasena } = usuario;
    const query = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)';
    const values = [nombre, correo, contrasena];

    try {
      const result = await pool1.query(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM usuarios';

    try {
      const usuarios = await pool1.query(query);
      return usuarios;
    } catch (error) {
      throw error;
    }
  }

    static async findByPk(id) {
      const query = 'SELECT * FROM usuarios WHERE id = ?';
      const values = [id];

      try {
          const [usuario] = await pool1.query(query, values);

          // Si no se encontró el usuario, devolver null
          return usuario.length > 0 ? usuario[0] : null;
      } catch (error) {
          throw error;
      }
  }

  static async update(id, usuario) {
    const { nombre, correo, contrasena } = usuario;
    const query = 'UPDATE usuarios SET nombre = ?, correo = ?, contrasena = ? WHERE id = ?';
    const values = [nombre, correo, contrasena, id];

    try {
      const result = await pool1.query(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByPk(id) {
    const query = 'DELETE FROM usuarios WHERE id = ?';
    const values = [id];

    try {
      const result = await pool1.query(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Usuario;