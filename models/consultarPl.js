// usuarioModel.js
const { pool1 } = require('../config/db');

class PlConsultar {

  static async findAll() {
    const query = "SELECT TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, COUNT(*) AS CANTIDAD, AVG(TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.VALOR) AS VR_PROMEDIO, SUM(TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.VALOR) AS VR_TOTAL FROM TB_REGISTROS_LIQUIDACION LEFT JOIN TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS ON TB_REGISTROS_LIQUIDACION.TB_PEDIDOS_MARCA = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.MARCA AND TB_REGISTROS_LIQUIDACION.CEDI = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.CEDI AND TB_REGISTROS_LIQUIDACION.TB_PEDIDOS_CODIGO_ZONA = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.ZONA AND TB_REGISTROS_LIQUIDACION.TB_PEDIDOS_CIUDAD = TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS.POBLACION WHERE MANIFIESTO_URBANO = 'MU-9185231006-TQV22E-6' AND TB_PEDIDOS_TIPO_PRODUCTO = 'PEDIDO' AND TB_PEDIDOS_CAJAS = '1' GROUP BY TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO";

    try {
      const pls = await pool1.query(query);
      return pls;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = PlConsultar;