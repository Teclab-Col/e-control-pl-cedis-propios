const { pool1, pool2 } = require("../config/db");

class ConsultarManifiestosModel {
  static async findManifiestoByPkAndInsert(manifiestoReq) {
    try {
      const queryComprobante =
        "SELECT TB_CARGUE.CEDI, TB_CARGUE.PLACA, TB_CARGUE.TIPO_DE_TARIFA, TB_VEHICULO.TB_VEHICULO_TIPO_DE_VEHICULO FROM `TB_CARGUE` LEFT JOIN TB_VEHICULO ON TB_CARGUE.PLACA = TB_VEHICULO.TB_VEHICULO_PLACA WHERE `MANIFIESTO_URBANO` = ? ;";
      const valueSelect = [manifiestoReq];
      const resultComprobante = await pool2.query(
        queryComprobante,
        valueSelect
      );
      if (resultComprobante && resultComprobante.length > 0) {
        for (const rowDataWithoutPK of resultComprobante) {
          const objectValues = Object.values(rowDataWithoutPK);
          for (const values of objectValues) {
            const res = values;
            const tipo_vehiculo = res.TB_VEHICULO_TIPO_DE_VEHICULO;
            console.log(`TIPO DE VEHICULO : ${tipo_vehiculo}`);
            //await this.insertDataIntoPool1(res);
          }
        }
      } else {
        console.error(
          `No se encontraron resultados para el manifiesto ${manifiestoReq}`
        );
      }
    } catch (error) {
      throw error;
    }

    try {
      const querySelect = `
                SELECT TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA
                FROM TB_PEDIDOS_REGISTRADOS
                WHERE MANIFIESTO_URBANO = ? 
                UNION 
                SELECT TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA
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
      //return resultSelect;
    } catch (error) {
      throw error;
    }

    try {
      const querySelectPq = `SELECT no_guia, nit_remitente, tipo_servicio, generador, ciudad_origen, departamento_origen, no_pedido, 
            no_factura_c, cedula, ciudad_destino, departamento_destino, contenido, categoria, valor_declarado, metodo_pago, 
            valor_del_recaudo, alto, ancho, largo, peso, peso_volumetrico, cant_cajas, estado, token, codigo_cargue, 
            consecutivo_cargue, manifiesto_urbano, placa_en_reparto, fecha, fecha_recoleccion, entregado, tarifa, 
            valor_manejo, liquidado, consecutivo_facturacion, no_factura, valor_unit FROM TB_PAQUETEOS 
            WHERE consecutivo_cargue = ?`;

      //const valueSelect = ["MU-5491231123-STV208-6"];
      const valueSelect = [manifiestoReq];
      const resultSelectPq = await pool2.query(querySelectPq, valueSelect);

      if (resultSelectPq && resultSelectPq.length > 0) {
        for (const rowDataWithoutPK of resultSelectPq) {
          const objectValues = Object.values(rowDataWithoutPK);
          for (const values of objectValues) {
            const res = values;
            await this.insertDataPqIntoPool1(res);
          }
        }
      } else {
        console.error(
          `No se encontraron resultados para el manifiesto ${manifiestoReq}`
        );
      }
    } catch (error) {
      throw error;
    }
    return true;
  }

  static async insertDataIntoPool1(res) {
    const valorBarcodeCaja = res.TB_PEDIDOS_BARCODE_CAJA;
    //console.log(`Valor de TB_PEDIDOS_BARCODE_CAJA : ${valorBarcodeCaja}`);
    if (valorBarcodeCaja) {
      try {
        const queryInsert = `
            INSERT IGNORE INTO TB_VALIDACION_ROTULOS_VD (TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valuesInsert = [
          res.TB_PEDIDOS_BARCODE_CAJA,
          res.CEDI,
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

  static async insertDataPqIntoPool1(res) {
    const valorBarcodeCaja = res.no_guia;

    if (valorBarcodeCaja) {
      console.log(`Valor de no_guia : ${valorBarcodeCaja}`);

      let cedi;
      if (res.departamento_destino == "Antioquia") {
        cedi = 6;
      } else if (
        res.departamento_destino == "Valle del cauca" ||
        res.departamento_destino == "Cali"
      ) {
        cedi = 39;
      } else {
        cedi = 0;
      }

      try {
        const queryInsert = `
            INSERT IGNORE INTO TB_VALIDACION_ROTULOS_PQ (no_guia, cedi, nit_remitente, tipo_servicio, generador, ciudad_origen, departamento_origen, no_pedido, 
                      no_factura_c, cedula, ciudad_destino, departamento_destino, contenido, categoria, valor_declarado, metodo_pago, 
                      valor_del_recaudo, alto, ancho, largo, peso, peso_volumetrico, cant_cajas, estado, token, codigo_cargue, 
                      consecutivo_cargue, manifiesto_urbano, placa_en_reparto, fecha, fecha_recoleccion, entregado, tarifa, 
                      valor_manejo, liquidado, consecutivo_facturacion, no_factura, valor_unit)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const valuesInsert = [
          res.no_guia,
          cedi,
          res.nit_remitente,
          res.tipo_servicio,
          res.generador,
          res.ciudad_origen,
          res.departamento_origen,
          res.no_pedido,
          res.no_factura_c,
          res.cedula,
          res.ciudad_destino,
          res.departamento_destino,
          res.contenido,
          res.categoria,
          res.valor_declarado,
          res.metodo_pago,
          res.valor_del_recaudo,
          res.alto,
          res.ancho,
          res.largo,
          res.peso,
          res.peso_volumetrico,
          res.cant_cajas,
          res.estado,
          res.token,
          res.codigo_cargue,
          res.consecutivo_cargue,
          res.manifiesto_urbano,
          res.placa_en_reparto,
          res.fecha,
          res.fecha_recoleccion,
          res.entregado,
          res.tarifa,
          res.valor_manejo,
          res.liquidado,
          res.consecutivo_facturacion,
          res.no_factura,
          res.valor_unit,
        ];

        await pool1.query(queryInsert, valuesInsert);
      } catch (error) {
        console.error("Error en la inserción paqueteo:", error);
        throw error;
      }
    }
  }
}

module.exports = ConsultarManifiestosModel;
