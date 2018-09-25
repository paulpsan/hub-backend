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
    if (entity) {
      return res
        .status(statusCode)
        .json(entity)
        .end();
    }
    return null;
  };
}
function sendEmail() {
  return function (entity) {
    return 
  };
}

function saveUpdates(updates) {
  return function (entity) {
    return entity
      .updateAttributes(updates)
      .then(updated => {
        if (updates.estado == "aprobado") {
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
        }
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
        visibility: "public"
      }
      return GroupGitlab.create(data).then(respGitlab => {
        let user = [{
          user_id: usuario._id,
          access_level: 30
        }]
        data._id = respGitlab.id
        data.visibilidad = respGitlab.visibility;
        return Grupo.create(data).then(resp => {
          let obj = {
            fk_usuario: usuario._id,
            fk_grupo: resp._id,
            nombre_permiso: 'desarrollador',
            access_level: 30,
          }
          UsuarioGrupo.create(obj)
          return MemberGitlab.addGroup(respGitlab.id, user).then(response => {
            console.log(response);
            return entity;
          }).catch(err => {
            console.log(err);
            throw err;
          });

        }).catch(err => {
          console.log(err);
          throw err;
        });
      })

    }).catch(err => {
      console.log(err);
      throw err;
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
      res.status(404).json({
        message: "Solicitud no se encuentra"
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
      if (err.errors)
        res.status(500).send(err);
    }
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
  return Solicitud.find({
      where: {
        fk_usuario: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Solicitud in the DB
export function create(req, res) {
  return Grupo.find({
    where: {
      path: req.body.path
    }
  }).then(resp => {
    if (resp == null) {
      return Solicitud.find({
        where: {
          path: req.body.path
        }
      }).then(resp => {
        if (resp == null) {
          return Solicitud.create(req.body)
            .then(respondWithResult(res, 201))
            .catch(handleError(res));
        } else {
          res.status(409).send({
            message: "El Path ya esta en uso"
          });
        }
      })
    } else {
      res.status(409).send({
        message: "El Path ya esta en uso"
      });
    }
  })
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

export function approve(req, res) {
  return Solicitud.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(createGroup(req.body))
    .then(saveUpdates(req.body))
    .then(sendEmail())
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