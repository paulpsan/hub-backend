'use strict';

import Ordenador from './ordering';
import Paginador from './pagination';
import Inclusor from './include';

//sugerir un cambio de nombre
class SequelizeHelper {

  static generarOpciones(query) {
    console.log("query",query);
    let opciones = {};
    //orden
    if (query.ordenar) {
      opciones.order = Ordenador.ordenacionSequelize(query.ordenar, query.orden);
    }
    //paginacion
    opciones = Object.assign(opciones, Paginador.paginacionSequelize(query.pagina, query.limite));
    //inclusiones
    if (query.incluir || query.atributos) {
      opciones.include = Inclusor.incluirSequelize(query.incluir, query.atributos);
    }
    let atributosImplicitos = Inclusor.obtnerAtributos(query.atributos);
    if (atributosImplicitos !== null) {
      opciones = Object.assign(opciones, atributosImplicitos);
    }
    console.log("opciones:",opciones);
    return opciones;
  }

  static generarRespuesta(datos, opciones) {
    console.log("datos",datos);
    return Paginador.respuestaPaginacion(datos.rows.length, datos.rows, opciones.offset / opciones.limit, opciones.limit);
  }
}

export default SequelizeHelper;
