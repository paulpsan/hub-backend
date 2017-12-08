'use strict';

import Ordenador from './ordering';
import Paginador from './pagination';
import Inclusor from './include';

//sugerir un cambio de nombre
class SequelizeHelper {

  static generarOpciones(query) {
    console.log(query);
    let opciones = {};
    //orden
    if (query.ordenar_por) {
      opciones.order = Ordenador.ordenacionSequelize(query.ordenar_por, query.orden);
    }
    //paginacion
    opciones = Object.assign(opciones, Paginador.paginacionSequelize(query.pagina, query.numero));
    //inclusiones
    if (query.incluir || query.atributos) {
      opciones.include = Inclusor.incluirSequelize(query.incluir, query.atributos);
    }
    let atributosImplicitos = Inclusor.obtnerAtributos(query.atributos);
    if (atributosImplicitos !== null) {
      opciones = Object.assign(opciones, atributosImplicitos);
    }
    console.log(opciones);
    return opciones;
  }

  static generarRespuesta(datos, opciones) {
    return Paginador.respuestaPaginacion(datos.count, datos.rows, opciones.offset / opciones.limit, opciones.limit);
  }
}

export default SequelizeHelper;
