// models/AuthModel.js
const db = require('../config/db');

class AuthModel {
  // Obtener un usuario por correo y contraseña
  static async obtenerPorCredenciales(correo, contrasena) {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [correo, contrasena]);
    return rows[0];
  }
}

module.exports = AuthModel;