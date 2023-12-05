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
          const objectValues = Object.values(rowDataWithoutPK);
          for (const values of objectValues) {
            const res = values;
            await this.insertDataIntoPool1(res);
          }
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

  static async insertDataIntoPool1(res) {
    const valorBarcodeCaja = res.TB_PEDIDOS_BARCODE_CAJA;
    console.log(`Valor de TB_PEDIDOS_BARCODE_CAJA : ${valorBarcodeCaja}`);
    if (valorBarcodeCaja) {
      try {
        const queryInsert = `
            INSERT INTO TB_VALIDACION_ROTULOS_VD (TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valuesInsert = [
          res.TB_PEDIDOS_BARCODE_CAJA,
          res.MANIFIESTO_URBANO,
          res.PLACA_DE_REPARTO,
          res.ESTADO,
          res.TB_PEDIDOS_MARCA,
          res.TB_PEDIDOS_CODIGO_ZONA,
          res.TB_PEDIDOS_CIUDAD,
          res.TB_PEDIDOS_TIPO_PRODUCTO,
          res.TB_PEDIDOS_CEDULA,
        ];

        await pool1.query(queryInsert, valuesInsert);
      } catch (error) {
        console.error("Error en la inserción:", error);
        throw error;
      }
    }
  }
}

module.exports = ConsultarManifiestosModel;
