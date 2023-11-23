const db = require("../config/db");

class RotulosPlModel {
  static async findByPk(codigoDeBarrasReq) {
    const query =
      "SELECT CODIGO_PK, TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO FROM TB_PEDIDOS_DIGITALIZADO WHERE TB_PEDIDOS_BARCODE_CAJA = ?";
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
        MENSAJE: INICIO,
      } = rotuloPl[0];

      // Verificar si ya existe el MANIFIESTO_URBANO en TB_VALIDACION_ROTULOS
      const checkQuery =
        "SELECT * FROM TB_VALIDACION_ROTULOS WHERE MANIFIESTO_URBANO = ?";
      const checkValues = [MANIFIESTO_URBANO];
      const [existingRecord] = await db.query(checkQuery, checkValues);

      // Si no existe, realizar el insert de todos los registros con el mismo MANIFIESTO_URBANO
      if (existingRecord.length === 0) {
        console.log("No existe el manifiesto : " + [MANIFIESTO_URBANO]);

        const insertQuery =
          "INSERT INTO TB_VALIDACION_ROTULOS (`TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO`) SELECT `TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO` FROM TB_PEDIDOS_DIGITALIZADO WHERE MANIFIESTO_URBANO = ?";
        const insertValues = [MANIFIESTO_URBANO];
        await db.query(insertQuery, insertValues);

        const updateQuery =
          "UPDATE `TB_VALIDACION_ROTULOS` SET `LEIDO` = '1' WHERE TB_PEDIDOS_BARCODE_CAJA = ?";
        const updateValues = [TB_PEDIDOS_BARCODE_CAJA];
        await db.query(updateQuery, updateValues);
        /*
        const upsertQuery =
          "INSERT INTO TB_VALIDACION_ROTULOS (`TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO`, `LEIDO`) VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE `LEIDO` = 1";
        const upsertValues = [
          TB_PEDIDOS_BARCODE_CAJA,
          MANIFIESTO_URBANO,
          PLACA_DE_REPARTO,
          ESTADO,
        ];
        await db.query(upsertQuery, upsertValues);
        */
      } else {
        console.log("Nuevo manifiesto : " + [MANIFIESTO_URBANO]);
        // Si existe, realizar el update en TB_PEDIDOS_BARCODE_CAJA, LEIDO=1
        const upsertQuery =
          "INSERT INTO TB_VALIDACION_ROTULOS (`TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO`, `LEIDO`) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE `LEIDO` = 1";
        const upsertValues = [
          TB_PEDIDOS_BARCODE_CAJA,
          MANIFIESTO_URBANO,
          PLACA_DE_REPARTO,
          ESTADO,
        ];
        await db.query(upsertQuery, upsertValues);
      }

      return rotuloPl[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RotulosPlModel;
