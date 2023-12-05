const { pool1 } = require('../config/db');

class RotulosPlModel {
  static async findByPk(codigoDeBarrasReq, codeSession) {
    const query =
      "SELECT CODIGO_PK, TB_PEDIDOS_BARCODE_CAJA, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO FROM TB_REGISTROS_LIQUIDACION WHERE TB_PEDIDOS_BARCODE_CAJA = ?";
    const values = [codigoDeBarrasReq];

    try {
      const [rotuloPl] = await pool1.query(query, values);

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

      // Verificar si ya existe el MANIFIESTO_URBANO en TB_VALIDACION_ROTULOS
      const checkQuery =
        "SELECT * FROM TB_VALIDACION_ROTULOS WHERE MANIFIESTO_URBANO = ?";
      const checkValues = [MANIFIESTO_URBANO];
      const [existingRecord] = await pool1.query(checkQuery, checkValues);

      // Si no existe, realizar el insert de todos los registros con el mismo MANIFIESTO_URBANO
      if (existingRecord.length === 0) {
        console.log("No existe el manifiesto : " + [MANIFIESTO_URBANO]);

        const insertQuery =
          "INSERT INTO TB_VALIDACION_ROTULOS (`TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO`, `TB_PEDIDOS_MARCA`, `TB_PEDIDOS_CODIGO_ZONA`, `TB_PEDIDOS_CIUDAD`, `TB_PEDIDOS_TIPO_PRODUCTO`, `TB_PEDIDOS_CEDULA`, `TB_PEDIDOS_VEREDA`, `TB_PEDIDOS_MUNICIPIO_ENVIEXPRESS`, `TIPO_DE_CARGA`, `TIPO_DESTINO`) SELECT `TB_PEDIDOS_BARCODE_CAJA`, `MANIFIESTO_URBANO`, `PLACA_DE_REPARTO`, `ESTADO`, `TB_PEDIDOS_MARCA`, `TB_PEDIDOS_CODIGO_ZONA`, `TB_PEDIDOS_CIUDAD`, `TB_PEDIDOS_TIPO_PRODUCTO`, `TB_PEDIDOS_CEDULA`, `TB_PEDIDOS_VEREDA`, `TB_PEDIDOS_MUNICIPIO_ENVIEXPRESS`, `TIPO_DE_CARGA`, `TIPO_DESTINO` FROM TB_REGISTROS_LIQUIDACION WHERE MANIFIESTO_URBANO = ?";
        const insertValues = [MANIFIESTO_URBANO];
        await pool1.query(insertQuery, insertValues);
        
        // Verificar si ya existe el MANIFIESTO_URBANO en TB_VALIDACION_ROTULOS
        const getValues =
        "SELECT `TB_PEDIDOS_MARCA`, `TB_PEDIDOS_CODIGO_ZONA`, `TB_PEDIDOS_CIUDAD`, `TB_PEDIDOS_TIPO_PRODUCTO`, `TIPO_DESTINO` FROM `TB_VALIDACION_ROTULOS` WHERE `TB_PEDIDOS_BARCODE_CAJA` = ?";
        const barcodeValues = [TB_PEDIDOS_BARCODE_CAJA];
        const [existingRecord] = await pool1.query(getValues, barcodeValues);
        
        // Si el rotulo leido existe y cumple las condiciones actualizamos su estado LEIDO
        const updateQuery =
        "UPDATE TB_VALIDACION_ROTULOS SET LEIDO = '1', VALOR_UNITARIO = (SELECT VALOR FROM (SELECT TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.VALOR FROM TB_VALIDACION_ROTULOS LEFT JOIN TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS ON TB_VALIDACION_ROTULOS.TB_PEDIDOS_MARCA COLLATE utf8mb4_general_ci = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.MARCA COLLATE utf8mb4_general_ci AND TB_VALIDACION_ROTULOS.TB_PEDIDOS_CODIGO_ZONA COLLATE utf8mb4_general_ci = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.ZONA COLLATE utf8mb4_general_ci AND TB_VALIDACION_ROTULOS.TB_PEDIDOS_CIUDAD COLLATE utf8mb4_general_ci = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.POBLACION COLLATE utf8mb4_general_ci WHERE TB_VALIDACION_ROTULOS.TB_PEDIDOS_BARCODE_CAJA = ? LIMIT 0, 25) AS subquery) WHERE TB_PEDIDOS_BARCODE_CAJA = ?";
        const updateValues = [TB_PEDIDOS_BARCODE_CAJA, TB_PEDIDOS_BARCODE_CAJA];
        await pool1.query(updateQuery, updateValues);

        // Marcamos el codeSession a todos lo registros que esten asociados al MANIFIESTO_URBANO
        const updateSession = `UPDATE TB_VALIDACION_ROTULOS SET CODE_SESSION = ${codeSession} WHERE MANIFIESTO_URBANO = ?`;
        const updateValuesSession = [MANIFIESTO_URBANO];
        await pool1.query(updateSession, updateValuesSession);
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
        await pool1.query(upsertQuery, upsertValues);
      }

      return rotuloPl[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Consulta de manifiesto leidos con CODE_SESSION
  static async findByCodeSession(codeSession) {
    const query =
      "SELECT MANIFIESTO_URBANO, SUM(CASE WHEN LEIDO = '1' THEN 1 ELSE 0 END) AS LEIDOS, SUM(CASE WHEN LEIDO = '0' THEN 1 ELSE 0 END) AS NO_LEIDOS FROM `TB_VALIDACION_ROTULOS` WHERE CODE_SESSION = ? GROUP BY MANIFIESTO_URBANO";
    const values = [codeSession];
    try {
      const [manifiestosCodeSession] = await pool1.query(query, values);
      if (manifiestosCodeSession.length === 0) {
        return null;
      }
      const { MANIFIESTO_URBANO, LEIDO, CANTIDAD } = manifiestosCodeSession[0];
      return manifiestosCodeSession;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RotulosPlModel;
