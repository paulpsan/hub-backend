/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/categorias              ->  index
 * POST    /api/categorias              ->  create
 * GET     /api/categorias/:id          ->  show
 * PUT     /api/categorias/:id          ->  upsert
 * PATCH   /api/categorias/:id          ->  patch
 * DELETE  /api/categorias/:id          ->  destroy
 */

"use strict";

import {
  Categoria
} from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import {
  Sequelize
} from "sequelize";


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    console.log("esto es un", entity);
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
        throw err;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.destroy().then(() => {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      console.log(entity);
      res.status(404).json({
        message: "Categoria no se encuentra"
      });
      return null;
    } else {
      return entity;
    }
  };
}

function handleError(res) {
  return function (err) {
    console.log(err);
    if (err.statusCode) {
      let statusCode = err.statusCode ? err.statusCode : 500;
      res.status(statusCode).send(err.error);
    } else {
      if (err.name = "SequelizeUniqueConstraintError")
        res.status(409).send({
          message: "El Campo tiene que ser único"
        });

      if (err.errors)
        res.status(500).send(err);
    }
  };
}



// Gets a list of categorias y busca categoria
export function index(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Categoria.findAndCountAll({
        order: [
          ["nombre", "desc"]
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
    return Categoria.findAndCountAll({
        order: [
          ["nombre", "desc"]
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

// Gets a single Categoria from the DB
export function show(req, res) {
  return Categoria.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  return Categoria.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Categoria.upsert(req.body, {
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function patch(req, res) {
  return Categoria.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Categoria from the DB
export function destroy(req, res) {
  return Categoria.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}