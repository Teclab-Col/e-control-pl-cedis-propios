const { pool1, pool2 } = require("../config/db");
let i = 0;
var cantVD = 0;
var cantPQ = 0;
let tipoTarifa;
let tipoVehiculo;
let valorApagarEbox;
class ConsultarManifiestosModel {
  /////////////////////////////FUNCION PRINCIPAL////////////////////////////////////////////////
  static async findManifiestoByPkAndInsert(manifiestoReq) {
    var { res, tipo_Tarifa, tipo_Vehiculo } = await this.Comprobante(
      manifiestoReq
    );
    tipoTarifa = tipo_Tarifa;
    tipoVehiculo = tipo_Vehiculo;
    var data = res;
    console.log(
      "DEBUG tipoTarifa: " + tipoTarifa + " tipoVehiculo: " + tipoVehiculo
    );
    await this.PedidosEbox(manifiestoReq);
    await this.PedidosVentaDirecta(manifiestoReq);
    await this.insertComprobante(data, manifiestoReq, cantVD, cantPQ);
    var dataPQ = await this.agrupacionPQ(manifiestoReq);
    var dataVD = await this.agrupacionVD(manifiestoReq);
    return { VD: dataVD, PQ: dataPQ };
  }

  /////////////////////////////FUNCIONES SECUNDARIAS////////////////////////////////////////////////
  static async agrupacionVD(manifiestoReq) {
    try {
      const queryGroup =
        "SELECT TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CAJAS, COUNT(*) AS CANTIDAD, SUM(VALOR_UNITARIO) AS SUB_TOTAL FROM TB_VALIDACION_ROTULOS_VD WHERE LEIDO = '0' AND MANIFIESTO_URBANO = ? GROUP BY TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CAJAS";
      const valueSelect = [manifiestoReq];
      const resultAgrupacion = await pool1.query(queryGroup, valueSelect);
      if (resultAgrupacion && resultAgrupacion.length > 0) {
        return resultAgrupacion[0];
      }
    } catch (error) {
      throw error;
    }
  }

  static async agrupacionPQ(manifiestoReq) {
    try {
      const queryGroup =
        "SELECT generador, departamento_destino, COUNT(*) AS cantidad, SUM(valor_unit) AS sub_total FROM TB_VALIDACION_ROTULOS_PQ WHERE leido = '0' AND consecutivo_cargue = ? GROUP BY generador, departamento_destino";
      const valueSelect = [manifiestoReq];
      const resultAgrupacion = await pool1.query(queryGroup, valueSelect);
      if (resultAgrupacion && resultAgrupacion.length > 0) {
        return resultAgrupacion[0];
      }
    } catch (error) {
      throw error;
    }
  }

  static async Comprobante(manifiestoReq) {
    try {
      const queryComprobante =
        "SELECT TB_CARGUE.CEDI, TB_CARGUE.PLACA, TB_CARGUE.TIPO_DE_TARIFA, TB_VEHICULO.TB_VEHICULO_TIPO_DE_VEHICULO FROM `TB_CARGUE` LEFT JOIN TB_VEHICULO ON TB_CARGUE.PLACA = TB_VEHICULO.TB_VEHICULO_PLACA WHERE `MANIFIESTO_URBANO` = ? limit 1;";
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
            var tipo_Tarifa = res.TIPO_DE_TARIFA;
            var tipo_Vehiculo = res.TB_VEHICULO_TIPO_DE_VEHICULO;
            if (res.CEDI) {
              console.log(
                "comprobante => tipoTarifa: " +
                  tipo_Tarifa +
                  " tipoVehiculo :" +
                  tipo_Vehiculo
              );

              return { res, tipo_Tarifa, tipo_Vehiculo };
            }
          }
        }
      } else {
        /*console.error(
          `No se encontraron resultados para el manifiesto ${manifiestoReq}`
        );*/
      }
    } catch (error) {
      throw error;
    }
  }

  static async PedidosVentaDirecta(manifiestoReq) {
    try {
      const querySelect = `
                SELECT TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA, TB_PEDIDOS_CAJAS
                FROM TB_PEDIDOS_REGISTRADOS
                WHERE MANIFIESTO_URBANO = ? 
                UNION ALL
                SELECT TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA, TB_PEDIDOS_CAJAS
                FROM TB_PEDIDOS_DIGITALIZADO
                WHERE MANIFIESTO_URBANO = ?`;

      const valueSelect = [manifiestoReq, manifiestoReq];
      const resultSelect = await pool2.query(querySelect, valueSelect);

      if (resultSelect && resultSelect.length > 0) {
        // Obtén el primer elemento (el array de objetos)
        const filasSeleccionadas = resultSelect[0];
        // Obtén la cantidad de filas (objetos) en el array
        cantVD = filasSeleccionadas.length;
        console.log("PedidosVentaDirecta = > cantVD : " + cantVD);

        for (const rowDataWithoutPK of resultSelect) {
          const objectValues = Object.values(rowDataWithoutPK);
          for (const values of objectValues) {
            const res = values;
            await this.insertDataIntoPool1(res, cantVD);
          }
        }
      } else {
        console.error(
          `No se encontraron resultados en Venta directa para el manifiesto ${manifiestoReq}`
        );
      }
      //return resultSelect;
    } catch (error) {
      throw error;
    }
  }

  static async PedidosEbox(manifiestoReq) {
    try {
      const querySelectPq = `SELECT no_guia, nit_remitente, tipo_servicio, generador, ciudad_origen, departamento_origen, no_pedido, 
            no_factura_c, cedula, ciudad_destino, departamento_destino, contenido, categoria, valor_declarado, metodo_pago, 
            valor_del_recaudo, alto, ancho, largo, peso, peso_volumetrico, cant_cajas, estado, token, codigo_cargue, 
            consecutivo_cargue, manifiesto_urbano, placa_en_reparto, fecha, fecha_recoleccion, entregado, tarifa, 
            valor_manejo, liquidado, consecutivo_facturacion, no_factura, valor_unit FROM TB_PAQUETEOS 
            WHERE consecutivo_cargue = ?`;

      const valueSelect = [manifiestoReq];
      const resultSelectPq = await pool2.query(querySelectPq, valueSelect);

      if (resultSelectPq && resultSelectPq.length > 0) {
        // Obtén el primer elemento (el array de objetos)
        const filasSeleccionadasPq = resultSelectPq[0];
        // Obtén la cantidad de filas (objetos) en el array
        cantPQ = filasSeleccionadasPq.length;
        console.log("PedidosEbox => cantPQ : " + cantPQ);
        for (const rowDataWithoutPK of resultSelectPq) {
          const objectValues = Object.values(rowDataWithoutPK);
          for (const values of objectValues) {
            const res = values;
            await this.insertDataPqIntoPool1(res);
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
  }

  static async insertComprobante(res, manifiestoReq, cantVD, cantPQ) {
    const tipo_vehiculo = res.TB_VEHICULO_TIPO_DE_VEHICULO;
    if (tipo_vehiculo) {
      try {
        const queryInsert = `INSERT IGNORE INTO TB_NUMERACIONES_COMPROBANTES (CEDI,MANIFIESTO,PLACA,TIPO_DE_VEHICULO,TIPO_DE_TARIFA,CANT_VD,CANT_PQ) VALUES(?,?,?,?,?,?,?)`;
        const valuesInsert = [
          res.CEDI,
          manifiestoReq,
          res.PLACA,
          res.TB_VEHICULO_TIPO_DE_VEHICULO,
          res.TIPO_DE_TARIFA,
          cantVD,
          cantPQ,
        ];
        await pool1.query(queryInsert, valuesInsert);
      } catch (error) {
        console.error("Error en la inserción Comprobante:", error);
        throw error;
      }
    }
  }

  static async insertDataIntoPool1(res) {
    const valorBarcodeCaja = res.TB_PEDIDOS_BARCODE_CAJA;
    const tipo_Tarifa = tipoTarifa;
    const tipo_vehiculo = tipoVehiculo;
    let valorPedido;
    //console.log(`Valor de TB_PEDIDOS_BARCODE_CAJA : ${valorBarcodeCaja}`);
    if (valorBarcodeCaja) {
      try {
        //console.log("tipo_vehiculo =  " + tipo_vehiculo);
        //console.log("tipo_tarifa =  " + tipo_Tarifa);
        if (tipo_Tarifa == "1") {
          // Tarifa vehiculo dedicado
          const queryValor =
            "SELECT VALOR, VALOR_VD FROM TB_LISTA_DE_PRECIOS_DEDICADOS WHERE VALOR <> '' AND CEDI = ? AND TIPO_DE_VEHICULO = ?";

          const value = [res.CEDI, tipo_vehiculo];

          const result = await pool1.query(queryValor, value);

          //const resultJSON = JSON.stringify(result);
          //console.log("CEDI =  " + res.CEDI);
          //console.log("Resultado en formato JSON:", resultJSON);

          if (result[0][0]) {
            // Resultados
            const valorDedicado = result[0][0]?.VALOR;
            const valorVentaDirecta = result[0][0]?.VALOR_VD;
            //console.log("Valor Dedicado: " + valorDedicado);
            //console.log("Valor Venta Directa: " + valorVentaDirecta);

            // Calculos Matematicos
            const valorTotalVd = cantVD * valorVentaDirecta;
            const restaVentaDirectaValorDedicado = valorTotalVd - valorDedicado;

            // Resultados
            valorApagarEbox = restaVentaDirectaValorDedicado / cantPQ;
            valorPedido = valorTotalVd / cantVD;

            /*console.log(
              "VALOR VD: " +
                valorPedido +
                "VALOR PQ: " +
                valorApagarEbox +
                "TOTAL VD: " +
                cantVD +
                "TOTAL PQ: " +
                cantPQ
            );
            */
          } else {
            //console.log("No se encontraron resultados.");
          }
        } else if (tipo_Tarifa == "2") {
          // Tarifa por entrega
          const queryValor =
            "SELECT VALOR, VRSEGUNDACAJA, CATALOGO, PREMIO FROM TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS WHERE CEDI = ? AND MARCA = ? AND ZONA = ? AND POBLACION = ? ;";

          const value = [
            res.CEDI,
            res.TB_PEDIDOS_MARCA,
            res.TB_PEDIDOS_CODIGO_ZONA,
            res.TB_PEDIDOS_CIUDAD,
          ];

          const result = await pool1.query(queryValor, value);

          console.log("Result[0][0]", result[0][0]);

          if (result[0][0]) {
            if (res.TB_PEDIDOS_TIPO_PRODUCTO == "PEDIDO") {
              if (res.TB_PEDIDOS_MARCA == "BELCORP") {
                if (res.TB_PEDIDOS_CAJAS == "1") {
                  valorPedido = result[0][0]?.VALOR;
                } else {
                  valorPedido = "0";
                }
              } else {
                valorPedido =
                  res.TB_PEDIDOS_CAJAS > 1
                    ? result[0][0]?.VRSEGUNDACAJA
                    : result[0][0]?.VALOR;
              }

              console.log("VALOR: " + valorPedido);
            } else if (res.TB_PEDIDOS_TIPO_PRODUCTO == "CATALOGO") {
              valorPedido = result[0][0]?.CATALOGO;
            } else if (res.TB_PEDIDOS_TIPO_PRODUCTO == "AFP") {
              valorPedido = result[0][0]?.PREMIO;
            } else {
              console.log(
                "VALOR NO ENCONTRADO: " + res.TB_PEDIDOS_TIPO_PRODUCTO
              );
            }
          } else {
            console.log("No se encontraron resultados...");
          }
        } else if (tipo_Tarifa == "3") {
          // Tarifa vehiculo dedicado
          const queryValor =
            "SELECT VALOR_MIXTO, VALOR_UNITARIO_MIXTO FROM TB_LISTA_DE_PRECIOS_DEDICADOS WHERE VALOR_UNITARIO_MIXTO <> '' AND CEDI = ? AND TIPO_DE_VEHICULO = ?";

          const value = [res.CEDI, tipo_vehiculo];

          const result = await pool1.query(queryValor, value);

          //console.log("Resultado completo:", result);

          if (result[0][0]) {
            // Resultados
            const valorDedicadoMixto = result[0][0]?.VALOR_MIXTO;
            const valorUnitarioMixto = result[0][0]?.VALOR_UNITARIO_MIXTO;

            let totalRegistros;
            console.log("Debugging  cantPQ: " + cantPQ);

            if (cantPQ && cantVD) {
              totalRegistros = parseFloat(cantVD) + parseFloat(cantPQ);
              console.log("Debugging totalRegistros 1: " + totalRegistros);
            } else if (cantVD) {
              totalRegistros = parseFloat(cantVD);
              console.log("Debugging totalRegistros 2: " + totalRegistros);
            } else if (cantPQ) {
              totalRegistros = parseFloat(cantPQ);
              console.log("Debugging totalRegistros 3: " + totalRegistros);
            }

            // Calculos Matematicos
            const valorMixtoDividido = valorDedicadoMixto / totalRegistros;
            const valorUnitarioMixtoTotal =
              parseFloat(valorUnitarioMixto) + parseFloat(valorMixtoDividido);
            const totalValorUnitarioMixto =
              totalRegistros * valorUnitarioMixtoTotal;

            // Resultados
            valorPedido = totalValorUnitarioMixto / totalRegistros;
            valorApagarEbox = totalValorUnitarioMixto / totalRegistros;

            console.log(
              "VALOR VD: " +
                valorPedido +
                "VALOR PQ: " +
                valorApagarEbox +
                " TOTAL VD: " +
                cantVD +
                " TOTAL PQ: " +
                cantPQ
            );
          } else {
            console.log("No se encontraron resultados.");
          }
        }
      } catch (error) {
        // Manejar errores aquí
        console.error("Error:", error);
      }

      //meter en el catch

      try {
        const queryInsert = `
    INSERT INTO TB_VALIDACION_ROTULOS_VD 
        (TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, 
        TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, 
        TB_PEDIDOS_CEDULA, TB_PEDIDOS_CAJAS, VALOR_UNITARIO)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        CEDI = VALUES(CEDI),
        PLACA_DE_REPARTO = VALUES(PLACA_DE_REPARTO),
        ESTADO = VALUES(ESTADO),
        TB_PEDIDOS_MARCA = VALUES(TB_PEDIDOS_MARCA),
        TB_PEDIDOS_CODIGO_ZONA = VALUES(TB_PEDIDOS_CODIGO_ZONA),
        TB_PEDIDOS_CIUDAD = VALUES(TB_PEDIDOS_CIUDAD),
        TB_PEDIDOS_TIPO_PRODUCTO = VALUES(TB_PEDIDOS_TIPO_PRODUCTO),
        TB_PEDIDOS_CEDULA = VALUES(TB_PEDIDOS_CEDULA),
        TB_PEDIDOS_CAJAS = VALUES(TB_PEDIDOS_CAJAS),
        VALOR_UNITARIO = VALUES(VALOR_UNITARIO);
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
          res.TB_PEDIDOS_CAJAS,
          valorPedido,
        ];

        // Ejecuta la consulta y obtén el resultado
        const result = await pool1.query(queryInsert, valuesInsert);
        // Obtén la cantidad de registros afectados
        const cantVD = result.affectedRows;
        return cantVD;
      } catch (error) {
        console.error("Error en la inserción:", error);
        throw error;
      }
    }
  }

  static async insertDataPqIntoPool1(res) {
    const valorBarcodeCaja = res.no_guia;

    if (valorBarcodeCaja) {
      //console.log(`Valor de no_guia : ${valorBarcodeCaja}`);
      let cedi;
      if (res.departamento_destino == "Cundinamarca") {
        cedi = 5;
      } else if (res.departamento_destino == "Antioquia") {
        cedi = 6;
      } else if (res.departamento_destino == "Atlantico") {
        cedi = 7;
      } else if (
        res.departamento_destino == "Valle del cauca" ||
        res.departamento_destino == "Cali"
      ) {
        cedi = 39;
      }

      try {
        const queryInsert = `
        INSERT INTO TB_VALIDACION_ROTULOS_PQ 
            (no_guia, cedi, nit_remitente, tipo_servicio, generador, ciudad_origen, departamento_origen, no_pedido, 
            no_factura_c, cedula, ciudad_destino, departamento_destino, contenido, categoria, valor_declarado, metodo_pago, 
            valor_del_recaudo, alto, ancho, largo, peso, peso_volumetrico, cant_cajas, estado, token, codigo_cargue, 
            consecutivo_cargue, manifiesto_urbano, placa_en_reparto, fecha, fecha_recoleccion, entregado, tarifa, 
            valor_manejo, liquidado, consecutivo_facturacion, no_factura, valor_unit)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
            cedi = VALUES(cedi),
            nit_remitente = VALUES(nit_remitente),
            tipo_servicio = VALUES(tipo_servicio),
            generador = VALUES(generador),
            ciudad_origen = VALUES(ciudad_origen),
            departamento_origen = VALUES(departamento_origen),
            no_pedido = VALUES(no_pedido),
            no_factura_c = VALUES(no_factura_c),
            cedula = VALUES(cedula),
            ciudad_destino = VALUES(ciudad_destino),
            departamento_destino = VALUES(departamento_destino),
            contenido = VALUES(contenido),
            categoria = VALUES(categoria),
            valor_declarado = VALUES(valor_declarado),
            metodo_pago = VALUES(metodo_pago),
            valor_del_recaudo = VALUES(valor_del_recaudo),
            alto = VALUES(alto),
            ancho = VALUES(ancho),
            largo = VALUES(largo),
            peso = VALUES(peso),
            peso_volumetrico = VALUES(peso_volumetrico),
            cant_cajas = VALUES(cant_cajas),
            estado = VALUES(estado),
            token = VALUES(token),
            codigo_cargue = VALUES(codigo_cargue),
            consecutivo_cargue = VALUES(consecutivo_cargue),
            manifiesto_urbano = VALUES(manifiesto_urbano),
            placa_en_reparto = VALUES(placa_en_reparto),
            fecha = VALUES(fecha),
            fecha_recoleccion = VALUES(fecha_recoleccion),
            entregado = VALUES(entregado),
            tarifa = VALUES(tarifa),
            valor_manejo = VALUES(valor_manejo),
            liquidado = VALUES(liquidado),
            consecutivo_facturacion = VALUES(consecutivo_facturacion),
            no_factura = VALUES(no_factura),
            valor_unit = VALUES(valor_unit);
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
          valorApagarEbox,
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
