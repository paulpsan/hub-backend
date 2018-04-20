/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/usuarios              ->  index
 * POST    /api/usuarios              ->  create
 * GET     /api/usuarios/:id          ->  show
 * PUT     /api/usuarios/:id          ->  upsert
 * PATCH   /api/usuarios/:id          ->  patch
 * DELETE  /api/usuarios/:id          ->  destroy
 */

"use strict";

import jsonpatch from "fast-json-patch";
import bcrypt from "bcrypt-nodejs";
import { Usuario } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import jwt from "../components/service/jwt";
import config from "../config/environment";
import qs from "querystring";
import https from "https";

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  // console.log("esto es un",entity);
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

// Gets a list of Usuarios
export function index(req, res) {
  return Usuario.findAndCountAll({
    include: [{ all: true }],
    order: [["clasificacion", "desc"]],
    offset: req.opciones.offset,
    limit: req.opciones.limit
  })
    .then(datos => {
      console.log("datos:", datos);
      return SequelizeHelper.generarRespuesta(datos, req.opciones);
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Usuario from the DB
export function show(req, res) {
  let opciones = {
    where: {
      _id: req.params.id
    }
  };
  return Usuario.find(Object.assign(opciones, req.opciones))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Usuario in the DB
export function create(req, res) {
  let obj = new Object();
  let params = req.body;
  obj.nombre = params.nombre;
  obj.email = params.email.toLowerCase();
  obj.password = params.password;
  obj.role = params.role;

  if (params.password) {
    bcrypt.hash(params.password, null, null, (err, hash) => {
      console.log(hash);
      obj.password = hash;
      if (obj.nombre != null && obj.email != null && obj.password != null) {
        return Usuario.create(obj)
          .then(respondWithResult(res, 201))
          .catch(handleError(res));
      } else {
        res.status(400).send({ message: "rellena todos los datos" });
      }
    });
  } else {
    res.status(500).send({ message: "introduce la contraseña" });
  }
  // return Usuario.create(obj)
  // .then(respondWithResult(res, 201))
  // .catch(handleError(res));
}
// Login usuario en la DB
export function login(req, res) {
  console.log("estoy aqui");
  const params = req.body;
  let email = params.email;
  let password = params.password;
  let tipo = params.tipo;
  Usuario.findOne({
    where: {
      email: email.toLowerCase(),
      tipo: tipo
    }
  })
    // .then(respondWithResult(res, 201))
    .then(user => {
      if (user != null) {
        console.log(user);
        bcrypt.compare(password, user.password, (err, check) => {
          if (check) {
            res.status(200).send({
              token: jwt.createToken(user),
              usuario: user
            });
          } else {
            res.status(404).send({ message: "Contraseña incorrecta" });
          }
        });
      } else {
        res
          .status(404)
          .send({ message: "No existe el usuario o contraseña incorrecta " });
      }

      // respondWithResult(res, 201)
    });
  // .catch(res.status(404).send({ message: "No existe el usuario o contraseña incorrecta " }));
}

// Upserts the given Usuario in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Usuario.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Usuario in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Usuario.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Usuario from the DB
export function destroy(req, res) {
  return Usuario.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
