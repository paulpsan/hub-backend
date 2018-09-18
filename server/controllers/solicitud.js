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
  Usuario,
  Grupo,
  UsuarioGrupo
} from "../sqldb";
import MemberGitlab from "../components/gitlab/memberGitlab";
import GroupGitlab from "../components/gitlab/groupGitlab";

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
  return function (entity) {
    console.log("esto es un", entity);
    if (!entity.error) {
      return res
        .status(statusCode)
        .json(entity)
        .end();
    } else {
      return res
        .status(entity.statusCode)
        .json(entity.error)
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
        return Usuario.find({
          where: {
            _id: updated.fk_usuario
          }
        }).then(user => {
          user.admin_grupo = true;
          user.save();
          return updated;
        }).catch(err => {
          console.log(err);
          return err;
        });
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  };
}

function createGroup(solicitud) {
  return function (entity) {
    return Usuario.find({
      where: {
        _id: solicitud.fk_usuario
      }
    }).then(usuario => {
      let data = {
        nombre: entity.institucion,
        path: entity.path,
        descripcion: entity.descripcion,
        visibility: "private"
      }
      return GroupGitlab.create(data).then(resp => {
        let user = [{
          user_id: usuario.usuarioGitlab,
          access_level: 50
        }]
        data.visibilidad = "private"
        data.id_gitlab = resp.id

        Grupo.create(data).then(resp => {
          let obj = {
            fk_usuario: usuario._id,
            fk_grupo: resp._id,
            nombre_permiso: 'propietario',
            access_level: 50,
          }
          UsuarioGrupo.create(obj)
        }).catch(err => {
          console.log(err);
          return err;
        });
        return MemberGitlab.addGroup(resp.id, user).then(response => {
          console.log(response);
          return entity;
        }).catch(err => {
          console.log(err);
          return err;
        });
      })

    }).catch(err => {
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
      console.log(entity);
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
      fk_usuario: req.params.id
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
    .then(createGroup(req.body))
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