/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/commits              ->  index
 * POST    /api/commits              ->  create
 * GET     /api/commits/:id          ->  show
 * PUT     /api/commits/:id          ->  upsert
 * PATCH   /api/commits/:id          ->  patch
 * DELETE  /api/commits/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Commit} from '../sqldb';

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
 * @api {get} /commits Obtener una lista paginada de commits
 * @apiName Commites
 * @apiGroup commits
 *
 * @apiParam (query) {String} [ordenar_por] Campo por el cual se debe ordenar la respuesta
 * @apiParam (query) {String} [orden="DESC"] Campo para cambiar el orden de los datos "ASC" ascendente y "DESC" descendente
 * @apiParam (query) {Number} [pagina=0] Numero de pagina que se debe retornar
 * @apiParam (query) {Number} [numero=10] Numero de elementos por página
 *
 */
export function index(req, res) {
  return Commit.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Commit from the DB
export function show(req, res) {
  return Commit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Commit in the DB
export function create(req, res) {
  return Commit.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Commit in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }

  return Commit.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Commit in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Commit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Commit from the DB
export function destroy(req, res) {
  return Commit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
