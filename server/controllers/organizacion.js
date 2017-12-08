/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/organizaciones              ->  index
 * POST    /api/organizaciones              ->  create
 * GET     /api/organizaciones/:id          ->  show
 * PUT     /api/organizaciones/:id          ->  upsert
 * PATCH   /api/organizaciones/:id          ->  patch
 * DELETE  /api/organizaciones/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Organizacion} from '../sqldb';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

/**
 * @api {get} /organizaciones Obtener una lista paginada de organizaciones
 * @apiName Organizaciones
 * @apiGroup organizaciones
 *
 * @apiParam (query) {String} [ordenar_por] Campo por el cual se debe ordenar la respuesta
 * @apiParam (query) {String} [orden="DESC"] Campo para cambiar el orden de los datos "ASC" ascendente y "DESC" descendente
 * @apiParam (query) {Number} [pagina=0] Numero de pagina que se debe retornar
 * @apiParam (query) {Number} [numero=10] Numero de elementos por página
 *
 */
export function index(req, res) {
  return Organizacion.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Organizacion from the DB
export function show(req, res) {
  return Organizacion.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Organizacion in the DB
export function create(req, res) {
  return Organizacion.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Organizacion in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }

  return Organizacion.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Organizacion in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Organizacion.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Organizacion from the DB
export function destroy(req, res) {
  return Organizacion.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
