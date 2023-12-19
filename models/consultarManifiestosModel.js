const { pool1, pool2 } = require("../config/db");
class ConsultarManifiestosModel {
  /////////////////////////////FUNCION PRINCIPAL////////////////////////////////////////////////
  static async findManifiestoByPkAndInsert(manifiestoReq) {
    //obtener informacion del Cargue
    const { tipo_Tarifa, tipo_Vehiculo, data } = await this.DataCargue(
      manifiestoReq
    );
    //Obtener informacion y calcular cantidad e-box
    const { cantPQ, resultSelectPq } = await this.PedidosEbox(manifiestoReq);
    //Obtener informacion y calcular cantidad Venta Directa
    const { cantVD, resultSelectVd } = await this.PedidosVentaDirecta(
      manifiestoReq
    );
    //Insertar informacion de ventadirecta y calcular Valor Ebox
    const valorApagarEbox = await this.insertDataVdIntoPool1(
      resultSelectVd,
      tipo_Tarifa,
      tipo_Vehiculo,
      cantVD,
      cantPQ
    );
    console.log("valorApagarEbox: " + valorApagarEbox);
    //Insertar informacion de E-box
    await this.insertDataPqIntoPool1(resultSelectPq, valorApagarEbox);
    //Insertar Comprobante
    await this.insertComprobante(data, manifiestoReq, cantVD, cantPQ);
    //Agrupaciones de respuesta
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

  static async insertComprobante(res, manifiestoReq, cantVD, cantPQ) {
    console.log("res :" + JSON.stringify(res[0]));
    var res = res[0];
    //const tipo_vehiculo = res[0].TB_VEHICULO_TIPO_DE_VEHICULO;
    console.log(
      "insertComprobante => cantVD: " + cantVD + ", cantPQ: " + cantPQ
    );
    //if (tipo_vehiculo) {
    try {
      const queryInsert = `
    INSERT INTO TB_NUMERACIONES_COMPROBANTES 
        (CEDI, MANIFIESTO, PLACA, TIPO_DE_VEHICULO, TIPO_DE_TARIFA, CANT_VD, CANT_PQ)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        CEDI = VALUES(CEDI),
        PLACA = VALUES(PLACA),
        TIPO_DE_VEHICULO = VALUES(TIPO_DE_VEHICULO),
        TIPO_DE_TARIFA = VALUES(TIPO_DE_TARIFA),
        CANT_VD = VALUES(CANT_VD),
        CANT_PQ = VALUES(CANT_PQ);
`;
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
    //}
  }

  static async insertDataPqIntoPool1(res, valorApagarEbox) {
    const listCedi = {
      Cundinamarca: 5,
      Antioquia: 6,
      Atlantico: 7,
      "Valle del cauca": 39,
      Cali: 39,
    };
    res.forEach(async (element) => {
      let cedi = listCedi[element.departamento_destino];
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
        //console.log("Debug valorApagarEbox :" + valorApagarEbox);
        const valuesInsert = [
          element.no_guia,
          cedi,
          element.nit_remitente,
          element.tipo_servicio,
          element.generador,
          element.ciudad_origen,
          element.departamento_origen,
          element.no_pedido,
          element.no_factura_c,
          element.cedula,
          element.ciudad_destino,
          element.departamento_destino,
          element.contenido,
          element.categoria,
          element.valor_declarado,
          element.metodo_pago,
          element.valor_del_recaudo,
          element.alto,
          element.ancho,
          element.largo,
          element.peso,
          element.peso_volumetrico,
          element.cant_cajas,
          element.estado,
          element.token,
          element.codigo_cargue,
          element.consecutivo_cargue,
          element.manifiesto_urbano,
          element.placa_en_reparto,
          element.fecha,
          element.fecha_recoleccion,
          element.entregado,
          element.tarifa,
          element.valor_manejo,
          element.liquidado,
          element.consecutivo_facturacion,
          element.no_factura,
          valorApagarEbox,
        ];

        await pool1.query(queryInsert, valuesInsert);
      } catch (error) {
        console.error("Error en la inserción paqueteo:", error);
        throw error;
      }
    });
  }

  static async insertDataVdIntoPool1(
    res,
    tipo_Tarifa,
    tipo_vehiculo,
    cantVD,
    cantPQ
  ) {
    let valorApagarEbox;
    let valorPedido;

    try {
      // Crear un array de promesas para las inserciones en la base de datos
      const insertPromises = res.map(async (element) => {
        if (tipo_Tarifa == "1") {
          const queryValor =
            "SELECT VALOR, VALOR_VD FROM TB_LISTA_DE_PRECIOS_DEDICADOS WHERE VALOR <> '' AND CEDI = ? AND TIPO_DE_VEHICULO = ?";
          const value = [res.CEDI, tipo_vehiculo];
          const [result1] = await pool1.query(queryValor, value);

          console.log("result1: " + JSON.stringify(result1[0]));

          if (result1[0]) {
            const valorDedicado = result1[0]?.VALOR;
            const valorVentaDirecta = result1[0]?.VALOR_VD;

            const valorTotalVd = cantVD * valorVentaDirecta;
            const restaVentaDirectaValorDedicado = valorTotalVd - valorDedicado;

            valorApagarEbox = restaVentaDirectaValorDedicado / cantPQ;
            valorPedido = valorTotalVd / cantVD;

            console.log(
              "VALOR VD1: " +
                valorPedido +
                "VALOR PQ1: " +
                valorApagarEbox +
                "TOTAL VD1: " +
                cantVD +
                "TOTAL PQ1: " +
                cantPQ
            );
          } else {
            console.log("No se encontraron resultados TARIFA 1.");
          }
        } else if (tipo_Tarifa == "2") {
          //console.log("TARIFA 2 DATA :" + JSON.stringify(element));
          const queryValor =
            "SELECT VALOR, VRSEGUNDACAJA, CATALOGO, PREMIO FROM TB_LISTA_DE_PRECIOS_CEDIS_PROPIOS WHERE CEDI = ? AND MARCA = ? AND ZONA = ? AND POBLACION = ? ;";
          const value = [
            element.CEDI,
            element.TB_PEDIDOS_MARCA,
            element.TB_PEDIDOS_CODIGO_ZONA,
            element.TB_PEDIDOS_CIUDAD,
          ];
          const [result2] = await pool1.query(queryValor, value);

          //console.log("result2: " + JSON.stringify(result2[0]));

          if (result2[0]) {
            if (element.TB_PEDIDOS_TIPO_PRODUCTO == "PEDIDO") {
              if (element.TB_PEDIDOS_MARCA == "BELCORP") {
                if (element.TB_PEDIDOS_CAJAS == "1") {
                  valorPedido = result2[0]?.VALOR;
                  console.log("BELCORP CAJA 1: " + valorPedido);
                } else {
                  valorPedido = "0";
                }
              } else {
                valorPedido =
                  element.TB_PEDIDOS_CAJAS > 1
                    ? result2[0]?.VRSEGUNDACAJA
                    : result2[0]?.VALOR;
                console.log("PEDIDO CAJA 2: " + valorPedido);
              }
            } else if (element.TB_PEDIDOS_TIPO_PRODUCTO == "CATALOGO") {
              valorPedido = result2[0]?.CATALOGO;
              console.log("CATALOGO: " + valorPedido);
            } else if (element.TB_PEDIDOS_TIPO_PRODUCTO == "AFP") {
              valorPedido = result2[0]?.PREMIO;
              console.log("AFP: " + valorPedido);
            } else {
              console.log(
                "VALOR NO ENCONTRADO: " + element.TB_PEDIDOS_TIPO_PRODUCTO
              );
            }
          } else {
            console.log("No se encontraron resultados TARIFA 2");
          }
        } else if (tipo_Tarifa == "3") {
          const queryValor =
            "SELECT VALOR_MIXTO, VALOR_UNITARIO_MIXTO FROM TB_LISTA_DE_PRECIOS_DEDICADOS WHERE VALOR_UNITARIO_MIXTO <> '' AND CEDI = ? AND TIPO_DE_VEHICULO = ?";
          const value = [element.CEDI, tipo_vehiculo];
          const [result3] = await pool1.query(queryValor, value);

          if (result3[0]) {
            const valorDedicadoMixto = result3[0]?.VALOR_MIXTO;
            const valorUnitarioMixto = result3[0]?.VALOR_UNITARIO_MIXTO;

            let totalRegistros;

            if (cantPQ && cantVD) {
              totalRegistros = parseFloat(cantVD) + parseFloat(cantPQ);
            } else if (cantVD) {
              totalRegistros = parseFloat(cantVD);
            } else if (cantPQ) {
              totalRegistros = parseFloat(cantPQ);
            }

            const valorMixtoDividido = valorDedicadoMixto / totalRegistros;
            const valorUnitarioMixtoTotal =
              parseFloat(valorUnitarioMixto) + parseFloat(valorMixtoDividido);
            const totalValorUnitarioMixto =
              totalRegistros * valorUnitarioMixtoTotal;

            if (totalRegistros > 0) {
              valorApagarEbox = totalValorUnitarioMixto / totalRegistros;
              valorPedido = totalValorUnitarioMixto / totalRegistros;
            } else {
              valorApagarEbox = 0;
              valorPedido = 0;
            }

            // console.log("Respuesta valorApagarEbox:- " + valorApagarEbox);
          } else {
            console.log("No se encontraron resultados TARIFA 3");
          }
        }

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
                VALOR_UNITARIO = VALUES(VALOR_UNITARIO);`;
        const valuesInsert = [
          element.TB_PEDIDOS_BARCODE_CAJA,
          element.CEDI,
          element.MANIFIESTO_URBANO,
          element.PLACA_DE_REPARTO,
          element.ESTADO,
          element.TB_PEDIDOS_MARCA,
          element.TB_PEDIDOS_CODIGO_ZONA,
          element.TB_PEDIDOS_CIUDAD,
          element.TB_PEDIDOS_TIPO_PRODUCTO,
          element.TB_PEDIDOS_CEDULA,
          element.TB_PEDIDOS_CAJAS,
          valorPedido,
        ];
        await pool1.query(queryInsert, valuesInsert);
      });

      // Esperar a que todas las inserciones se completen
      await Promise.all(insertPromises);
    } catch (error) {
      // Manejar errores aquí
      console.error("Error:", error);
    }

    //console.log("Respuesta valorApagarEbox:--- " + valorApagarEbox);
    if (valorApagarEbox) {
      return valorApagarEbox;
    } else {
      return 0;
    }
  }

  static async PedidosVentaDirecta(manifiestoReq) {
    try {
      const querySelectVd = `
                SELECT TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA, TB_PEDIDOS_CAJAS
                FROM TB_PEDIDOS_REGISTRADOS
                WHERE MANIFIESTO_URBANO = ? 
                UNION ALL
                SELECT TB_PEDIDOS_BARCODE_CAJA, CEDI, MANIFIESTO_URBANO, PLACA_DE_REPARTO, ESTADO, TB_PEDIDOS_MARCA, TB_PEDIDOS_CODIGO_ZONA, TB_PEDIDOS_CIUDAD, TB_PEDIDOS_TIPO_PRODUCTO, TB_PEDIDOS_CEDULA, TB_PEDIDOS_CAJAS
                FROM TB_PEDIDOS_DIGITALIZADO
                WHERE MANIFIESTO_URBANO = ?`;

      const valueSelect = [manifiestoReq, manifiestoReq];
      const [resultSelectVd] = await pool2.query(querySelectVd, valueSelect);
      let cantVD = resultSelectVd.length;
      //console.log("PedidosEbox => cantPQ : " + cantPQ);
      if (cantVD) {
        return { cantVD, resultSelectVd };
        //////////////////////////////
      } else {
        console.error(
          `No se encontraron resultados en VD para el manifiesto ${manifiestoReq}`
        );
      }
      ///
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
      const [resultSelectPq] = await pool2.query(querySelectPq, valueSelect);

      //console.log("resultSelectPq[0] =>  : " + JSON.stringify(resultSelectPq[0]));

      let cantPQ = resultSelectPq.length;
      //console.log("PedidosEbox => cantPQ : " + cantPQ);

      if (cantPQ) {
        return { cantPQ, resultSelectPq };
        //////////////////////////////
      } else {
        console.error(
          `No se encontraron resultados en PQ para el manifiesto ${manifiestoReq}`
        );
      }
    } catch (error) {
      throw error;
    }
  }

  static async DataCargue(manifiestoReq) {
    try {
      const queryComprobante =
        "SELECT TB_CARGUE.CEDI, TB_CARGUE.PLACA, TB_CARGUE.TIPO_DE_TARIFA, TB_VEHICULO.TB_VEHICULO_TIPO_DE_VEHICULO FROM `TB_CARGUE` LEFT JOIN TB_VEHICULO ON TB_CARGUE.PLACA = TB_VEHICULO.TB_VEHICULO_PLACA WHERE `MANIFIESTO_URBANO` = ? limit 1;";
      const valueSelect = [manifiestoReq];
      const [resultComprobante] = await pool2.query(
        queryComprobante,
        valueSelect
      );

      //console.log("resultComprobante :" + JSON.stringify(resultComprobante));

      if (resultComprobante.length > 0) {
        var tipo_Tarifa = resultComprobante[0].TIPO_DE_TARIFA;
        var tipo_Vehiculo = resultComprobante[0].TB_VEHICULO_TIPO_DE_VEHICULO;
        console.log(
          "comprobante => tipoTarifa: " +
            tipo_Tarifa +
            " tipoVehiculo :" +
            tipo_Vehiculo
        );
        const data = resultComprobante;
        return { tipo_Tarifa, tipo_Vehiculo, data };
      } else {
        console.error(
          `No se encontraron resultados para el manifiesto ${manifiestoReq}`
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ConsultarManifiestosModel;
