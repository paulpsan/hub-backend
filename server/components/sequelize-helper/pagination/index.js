'use strict';

class Paginador {

  static paginacionSequelize(pagina, numero) {
    let opcionesSequelize = {};
    if (Number.isInteger(Number(pagina)) && Number.isInteger(Number(numero))) {
      opcionesSequelize.offset = numero * (pagina - 1);
      opcionesSequelize.limit = numero;
    }
    return opcionesSequelize;
  }

  static respuestaPaginacion(total, datos, pagina, numero) {
    let respuesta = {
      datos,
      paginacion: {
        total,
        cantidad: datos.length,
        limite: Number(numero),
        paginaActual: pagina + 1,
        totalPaginas: Math.ceil(total / numero),
      }
    };
    return respuesta;
  }
}

export default Paginador;
