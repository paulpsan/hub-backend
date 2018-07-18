/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/ratings              ->  index
 * POST    /api/ratings              ->  create
 * GET     /api/ratings/:id          ->  show
 * PUT     /api/ratings/:id          ->  upsert
 * PATCH   /api/ratings/:id          ->  patch
 * DELETE  /api/ratings/:id          ->  destroy
 */

"use strict";

import bcrypt from "bcrypt-nodejs";
import { Rating, Repositorio } from "../sqldb";
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
    let rating = {};
    rating._id = entity._id;
    rating.email = entity.email;
    rating.estado = false;
    if (entity) {
      return entity
        .updateAttributes(rating)
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
function ratingProy(proyecto) {}

function setRating() {
  return new Promise((resolver, rechazar) => {
    Rating.find().then(resp => {
      console.log(resp);
    });
  });
}

export function setRating(req, res) {
  return Rating.find()
    .then(rating => {
      return Repositorio.find({
        where: {
          _id: req.params.id
        }
      })
        .then(repositorio => {
          if (rating.issues <= repositorio.issues.total) {
            rating.issues = repositorio.issues.total;
          }
          if (rating.stars <= repositorio.stars.total) {
            rating.stars = repositorio.stars.total;
          }
          if (rating.forks <= repositorio.forks.total) {
            rating.forks = repositorio.forks.total;
          }
          console.log(rating);

          rating.save();
          return rating;
        })
        .catch(err => {
          console.log(err);
        });
      console.log(req.params.id);
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of ratings y busca rating
export function index(req, res) {
  const Op = Sequelize.Op;
  Rating;
  return Rating.findAndCountAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Rating from the DB
export function show(req, res) {
  let opciones = {
    where: {
      _id: req.params.id
    }
  };
  return Rating.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Rating in the DB
export function create(req, res) {
  return Rating.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Rating.upsert(req.body, {
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
  return Rating.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Rating from the DB
export function destroy(req, res) {
  return Rating.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
