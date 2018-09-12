/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/grupos              ->  index
 * POST    /api/grupos              ->  create
 * GET     /api/grupos/:id          ->  show
 * PUT     /api/grupos/:id          ->  upsert
 * PATCH   /api/grupos/:id          ->  patch
 * DELETE  /api/grupos/:id          ->  destroy
 */

"use strict";

import { Grupo } from "../sqldb";
import GroupGitlab from "../components/gitlab/groupGitlab";

import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import { Sequelize } from "sequelize";
var fetch = require("node-fetch");

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}
function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  // console.log("esto es un",entity);
  return function(entity) {
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
  return function(entity) {
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
  return function(entity) {
    let grupo = {};
    grupo._id = entity._id;
    grupo.email = entity.email;
    grupo.estado = false;
    if (entity) {
      return entity
        .updateAttributes(grupo)
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

function setGrupo() {
  return new Promise((resolver, rechazar) => {
    Grupo.find().then(resp => {
      console.log(resp);
    });
  });
}

export function setGrupo(req, res) {
  return Grupo.find()
    .then(grupo => {
      return Repositorio.find({
        where: {
          _id: req.params.id
        }
      })
        .then(repositorio => {
          if (grupo.issues <= repositorio.issues.total) {
            grupo.issues = repositorio.issues.total;
          }
          if (grupo.stars <= repositorio.stars.total) {
            grupo.stars = repositorio.stars.total;
          }
          if (grupo.forks <= repositorio.forks.total) {
            grupo.forks = repositorio.forks.total;
          }
          console.log(grupo);

          grupo.save();
          return grupo;
        })
        .catch(err => {
          console.log(err);
        });
      console.log(req.params.id);
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of grupos y busca grupo
export function index(req, res) {
  return Grupo.findAndCountAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Grupo from the DB
export function show(req, res) {
  let opciones = {
    where: {
      _id: req.params.id
    }
  };
  return Grupo.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Grupo in the DB
export function create(req, res) {
  console.log(req);




  return Grupo.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Grupo.upsert(req.body, {
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
  return Grupo.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Grupo from the DB
export function destroy(req, res) {
  return Grupo.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
