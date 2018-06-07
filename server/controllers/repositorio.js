/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/repositorios              ->  index
 * POST    /api/repositorios              ->  create
 * GET     /api/repositorios/:id          ->  show
 * PUT     /api/repositorios/:id          ->  upsert
 * PATCH   /api/repositorios/:id          ->  patch
 * DELETE  /api/repositorios/:id          ->  destroy
 */

"use strict";

import jsonpatch from "fast-json-patch";
import { Repositorio } from "../sqldb";
import Gitlab from "../components/repository-proxy/repositories/gitlab";
import SequelizeHelper from "../components/sequelize-helper";
var fetch = require("node-fetch");

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy().then(() => {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
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

// Gets a list of Repositorios
export function index(req, res) {
  return Repositorio.findAndCountAll(req.opciones)
    .then(datos => {
      return SequelizeHelper.generarRespuesta(datos, req.opciones);
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function indexUser(req, res) {
  console.log(req.params.id);
  return Repositorio.findAndCountAll({
    // include: [{ all: true }],
    where: {
      fk_usuario: req.params.id
    }
  })
    .then(datos => {
      return SequelizeHelper.generarRespuesta(datos, req.opciones);
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
// Gets a single Repositorio from the DB
export function show(req, res) {
  return Repositorio.find({
    // include: [{ all: true }],
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function proyectos(req, res) {
  //esto se debe cambiar al proxy de repositorios
  let gitlab = new Gitlab("https://gitlab.geo.gob.bo", "7-VmBEpTd33s28N5dHvy");
  gitlab.proyectos().then(resultado => {
    res.send(resultado);
  });
}

// Creates a new Repositorio in the DB
export function create(req, res) {
  return Repositorio.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Repositorio in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Repositorio.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Repositorio in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Repositorio.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Repositorio from the DB
export function destroy(req, res) {
  return Repositorio.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
// devuelve list de lenguajes
export function lenguajes(req, res) {
  console.log("object", req.body);

  fetch(req.body.url)
    .then(getJson())
    .then(respuesta => {
      console.log(respuesta);
      res.send(respuesta);
    })
    .catch();
}
