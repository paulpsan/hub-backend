/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/solicituds              ->  index
 * POST    /api/solicituds              ->  create
 * GET     /api/solicituds/:id          ->  show
 * PUT     /api/solicituds/:id          ->  upsert
 * PATCH   /api/solicituds/:id          ->  patch
 * DELETE  /api/solicituds/:id          ->  destroy
 */

"use strict";

import bcrypt from "bcrypt-nodejs";
import {
  Solicitud,
  Repositorio
} from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import {
  Sequelize
} from "sequelize";
var fetch = require("node-fetch");

function getJson() {
  return function (resultado) {
    return resultado.json();
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  // console.log("esto es un",entity);
  return function (entity) {
    if (entity) {
      return res
        .status(statusCode)
        .json(entity)
        .end();
    }
    return null;
  };
}

function saveUpdates(updates) {
  return function (entity) {
    return entity
      .updateAttributes(updates)
      .then(updated => {
        return updated;
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    let solicitud = {};
    solicitud._id = entity._id;
    solicitud.email = entity.email;
    solicitud.estado = false;
    if (entity) {
      return entity
        .updateAttributes(solicitud)
        .then(updated => {
          console.log("--------", updated);
          return updated;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}



// Gets a list of solicituds y busca solicitud
export function index(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Solicitud.findAndCountAll({
        include: [{
          all: true
        }],
        order: [
          ["estado", "desc"]
        ],
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          nombre: {
            [Op.iLike]: "%" + req.query.buscar + "%"
          }
        }
      })
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    return Solicitud.findAndCountAll({
        include: [{
          all: true
        }],
        order: [
          ["estado", "desc"]
        ],
        offset: req.opciones.offset,
        limit: req.opciones.limit
      })
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

// Gets a single Solicitud from the DB
export function show(req, res) {
  let opciones = {
    where: {
      _id: req.params.id
    }
  };
  return Solicitud.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Solicitud in the DB
export function create(req, res) {
  return Solicitud.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Solicitud.upsert(req.body, {
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Solicitud.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Solicitud from the DB
export function destroy(req, res) {
  return Solicitud.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}