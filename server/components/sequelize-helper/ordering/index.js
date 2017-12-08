'use strict';

import {
  sequelize
} from '../../../sqldb';

/**
 * Valida si el campo por el que se quiere ordenar es JSON
 * @param {*} campo 
 */
function esCampoJson(campo) {
  return campo.includes('.');
}

class Ordenador {
  static ordenacionSequelize(ordenarPor, orden = 'DESC') {
    if (esCampoJson(ordenarPor)) {
      let order = [
        [sequelize.cast(sequelize.json(ordenarPor), 'integer'), orden]
      ];
      return order;
    } else {
      let order = [
        [ordenarPor, orden]
      ];
      return order;
    }
  }
}

export default Ordenador;
