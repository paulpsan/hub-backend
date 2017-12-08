'use strict';

class Paginador {

  static paginacionSequelize(pagina = 1, numero = 20) {
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
        porPagina: Number(numero),
        paginaActual: pagina + 1,
        totalPaginas: Math.ceil(total / numero),
      }
    };
    return respuesta;
  }
}

export default Paginador;
