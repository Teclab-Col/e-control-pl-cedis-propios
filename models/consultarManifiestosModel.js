const { pool1, pool2 } = require("../config/db");

class ConsultarManifiestosModel {
  static async findManifiestoByPkAndInsert(manifiestoReq) {
    try {
      const querySelect = `
                SELECT TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA
                FROM TB_PEDIDOS_REGISTRADOS
                WHERE MANIFIESTO_URBANO = ? 
                UNION 
                SELECT TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA
                FROM TB_PEDIDOS_DIGITALIZADO
                WHERE MANIFIESTO_URBANO = ?`;

      const valueSelect = [manifiestoReq, manifiestoReq];
      const resultSelect = await pool2.query(querySelect, valueSelect);

      if (resultSelect && resultSelect.length > 0) {
        for (const rowDataWithoutPK of resultSelect) {
          await this.insertDataIntoPool1(rowDataWithoutPK);
        }
      } else {
        console.error(
          `No se encontraron resultados para el manifiesto ${manifiestoReq}`
        );
      }

      return resultSelect;
    } catch (error) {
      throw error;
    }
  }

  static async insertDataIntoPool1(rowDataWithoutPK) {
    try {
      const queryInsert = `
                INSERT INTO TB_VALIDACION_ROTULOS (TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const valuesInsert = [
        rowDataWithoutPK.TB_PEDIDOS_BARCODE_CAJA,
        rowDataWithoutPK.MANIFIESTO_URBANO,
        rowDataWithoutPK.PLACA_DE_REPARTO,
        rowDataWithoutPK.ESTADO,
        rowDataWithoutPK.TB_PEDIDOS_MARCA,
        rowDataWithoutPK.TB_PEDIDOS_CODIGO_ZONA,
        rowDataWithoutPK.TB_PEDIDOS_CIUDAD,
        rowDataWithoutPK.TB_PEDIDOS_TIPO_PRODUCTO,
        rowDataWithoutPK.TB_PEDIDOS_CEDULA,
      ];

      // Utiliza la pool de conexión para realizar la inserción
      await pool1.query(queryInsert, valuesInsert);

      console.log(
        `Datos insertados en pool1: ${JSON.stringify(rowDataWithoutPK)}`
      );
    } catch (error) {
      console.error("Error en la inserción:", error);
      throw error;
    }
  }
}

module.exports = ConsultarManifiestosModel;
