const { pool1, pool2 } = require('../config/db');

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
                console.error(`No se encontraron resultados para el manifiesto ${manifiestoReq}`);
            }

            return resultSelect;
        } catch (error) {
            throw error;
        }
    }

    static async insertDataIntoPool1(rowDataWithoutPK) {
      try {
          // Obtén las columnas de la tabla de destino
          const destinationColumns = [
              'TB_PEDIDOS_BARCODE_CAJA', 'MANIFIESTO_URBANO', 'PLACA_DE_REPARTO', 'ESTADO',
              'TB_PEDIDOS_MARCA', 'TB_PEDIDOS_CODIGO_ZONA', 'TB_PEDIDOS_CIUDAD', 'TB_PEDIDOS_TIPO_PRODUCTO',
              'TB_PEDIDOS_CEDULA', 'TB_PEDIDOS_VEREDA', 'TB_PEDIDOS_MUNICIPIO_ENVIEXPRESS',
              'TIPO_DE_CARGA', 'TIPO_DESTINO', 'VALOR_UNITARIO', 'LEIDO', 'CODE_SESSION'
          ];
  
          // Añade valores predeterminados para todas las columnas
          const defaultValues = {
              TB_PEDIDOS_BARCODE_CAJA: 'valor_predeterminado_barcode',
              MANIFIESTO_URBANO: 'valor_predeterminado_manifiesto_urbano',
              PLACA_DE_REPARTO: 'valor_predeterminado_palca_de_reparto',
              ESTADO: 'valor_predeterminado_estado',
              TB_PEDIDOS_MARCA: 'valor_predeterminado_marca',
              TB_PEDIDOS_CODIGO_ZONA: 'valor_predeterminado_codigo_zona',
              TB_PEDIDOS_CIUDAD: 'valor_predeterminado_ciudad',
              TB_PEDIDOS_TIPO_PRODUCTO: 'valor_predeterminado_tipo_producto',
              TB_PEDIDOS_CEDULA: 'valor_predeterminado_cedula',
              TB_PEDIDOS_VEREDA: 'valor_predeterminado_vereda',
              TB_PEDIDOS_MUNICIPIO_ENVIEXPRESS: 'valor_predeterminado_municipio_enviexpress',
              TIPO_DE_CARGA: 'valor_predeterminado_carga',
              TIPO_DESTINO: 'valor_predeterminado_destino',
              VALOR_UNITARIO: '0',
              LEIDO: '0',
              CODE_SESSION: 'NAN'
          };
  
          // Completa los datos de entrada con los valores predeterminados
          const rowDataWithDefaults = { ...defaultValues, ...rowDataWithoutPK };
  
          // Obtén los valores correspondientes a las columnas seleccionadas
          const values = destinationColumns.map(column => rowDataWithDefaults[column]);
  
          // Crea placeholders para la consulta de inserción
          const placeholders = Array(values.length).fill('?').join(', ');
  
          // Construye la consulta de inserción
          const queryInsert = `INSERT INTO TB_VALIDACION_ROTULOS (${destinationColumns.join(', ')}) VALUES (${placeholders})`;
  
          console.log('Query de inserción:', queryInsert);
          console.log('Valores a insertar:', values);
  
          // Ejecuta la consulta de inserción
          const result = await pool1.query(queryInsert, values);
  
          console.log('Inserción exitosa. Resultado:', result);
      } catch (error) {
          console.error("Error en la inserción:", error);
      }
  }
}

module.exports = ConsultarManifiestosModel;