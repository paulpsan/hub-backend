'use strict';

import SequelizeHelper from '../sequelize-helper';

export function generarOpciones(req, res, next) {
  req.opciones = SequelizeHelper.generarOpciones(req.query);
  next();
}
