"use strict";

import SequelizeHelper from "../sequelize-helper";

export function generarOpciones(req, res, next) {
  console.log("*****query***********", req.query);
  req.opciones = SequelizeHelper.generarOpciones(req.query);
  next();
}
