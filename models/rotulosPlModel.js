const db = require('../config/db');

class RotulosPlModel {
  static async findByPk(codigoDeBarrasReq) {
    const query = 'SELECT CODIGO_PK, TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO FROM TB_PEDIDOS_DIGITALIZADO WHERE TB_PEDIDOS_BARCODE_CAJA = ?';
    const values = [codigoDeBarrasReq];

    try {
      const [rotuloPl] = await db.query(query, values);

      // Si no se encontró el usuario, devolver null
      if (rotuloPl.length === 0) {
        return null;
      }

      const {
        TB_PEDIDOS_BARCODE_CAJA,
        MANIFIESTO_URBANO,
        PLACA_DE_REPARTO,
        ESTADO,
      } = rotuloPl[0];

      // Ahora puedes realizar un insert utilizando estas variables
      const insertQuery = 'INSERT INTO TB_VALIDACION_ROTULOS (`TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO`) VALUES (?, ?, ?, ?)';
      const insertValues = [TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO];
      await db.query(insertQuery, insertValues);

      return rotuloPl[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RotulosPlModel;