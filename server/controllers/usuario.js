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

import bcrypt from "bcrypt-nodejs";
import {
  Usuario
} from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import jwt from "../components/service/jwt";
import captcha from "../components/service/captcha";
import Gitlab from "../components/service/gitlab"
import config from "../config/environment";
import qs from "querystring";


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
    let usuario = {};
    usuario._id = entity._id;
    usuario.email = entity.email;
    usuario.estado = false;
    if (entity) {
      return entity
        .updateAttributes(usuario)
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

// Gets a list of Usuarios y busca usuario
export function index(req, res) {
  console.log("Session**", req.session);
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Usuario.findAndCountAll({
        include: [{
          all: true
        }],
        offset: req.opciones.offset,
        limit: req.opciones.limit,
        where: {
          estado: true,
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
    console.log("req", req.usuario);
    return Usuario.findAndCountAll({
        // include: [{ all: true }],
        where: {
          estado: true
        },
        // order: [["clasificacion", "desc"]],
        offset: req.opciones.offset,
        limit: req.opciones.limit
      }, '_id nombre email')
      .then(datos => {
        return SequelizeHelper.generarRespuesta(datos, req.opciones);
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
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


export function captchaUser(req, res) {
  console.log("req", req.sessionID);
  var captchaSession = captcha.create();
  req.session.captcha = captchaSession.text;
  res.status(200).json({
    id: req.sessionID,
    captcha: captchaSession.data
  });
}

// Creates a new Usuario in the DB
export function create(req, res) {
  let captchaCurrent;
  captcha.getCurrent(req.body.sessionID).then(resp => {
    captchaCurrent = JSON.parse(resp).captcha
    if (req.body.captcha === captchaCurrent && captchaCurrent) {
      let obj = new Object();
      let params = req.body;
      obj.nombre = params.nombre;
      obj.email = params.email.toLowerCase();
      obj.password = params.password;
      obj.cuentas = ["local"];
      if (params.password) {
        bcrypt.hash(params.password, null, null, (err, hash) => {
          obj.password = hash;
          if (obj.nombre != null && obj.email != null && obj.password != null) {
            return Usuario.create(obj)
              .then(respondWithResult(res, 201))
              .catch(handleError(res));
          } else {
            res.status(409).send({
              message: "Introduce todos los campos"
            });
          }
        });
      }
    } else {
      res.status(409).send({
        message: "Captcha Invalido o Expirado"
      });
    }

  }).catch(err => {
    res.status(409).send({
      message: "Captcha Expirado"
    });
  })
}

export function createGitlab(req, res) {
  let captchaCurrent;
  captcha.getCurrent(req.body.usuario.sessionID).then(resp => {
    console.log(req.body.usuario.captcha, resp);
    captchaCurrent = JSON.parse(resp).captcha
    if (req.body.usuario.captcha === captchaCurrent && captchaCurrent) {
      console.log("entro.......");
      Gitlab.createGitlabUser(req.body.domain, req.body.token, req.body.usuario)
        .then(resp => {
          console.log(resp);
          res.send(resp);
        })
        .catch(err => {
          res.status(409).send(err);
        })


    } else {
      res.status(409).send({
        message: "Captcha Invalido o Expirado"
      });
    }

  }).catch(err => {
    res.status(409).send({
      message: "Captcha Expirado"
    });
  })
}
// Login usuario en la DB
export function login(req, res) {
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
        bcrypt.compare(password, user.password, (err, check) => {
          if (check) {
            res.status(200).send({
              token: jwt.createToken(user),
              usuario: user
            });
          } else {
            res.status(404).send({
              message: "Contraseña incorrecta"
            });
          }
        });
      } else {
        res
          .status(404)
          .send({
            message: "No existe el usuario o contraseña incorrecta "
          });
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
    .then(saveUpdates(req.body))
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
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Genera Json para graficos de usuarios - commits - proyecto
export function graficos(req, res) {
  return Usuario.find({
      where: {
        _id: req.params.id
      }
    })
    .then(generaDatos(res))
    .catch(handleError(res));
}

export function commitsGithub(req, res) {
  return Usuario.find({
      where: {
        _id: req.params.id
      }
    })
    .then(generaCommits(res))
    .catch(handleError(res));
}

export function commitsGitlab(req, res) {
  return Usuario.find({
      where: {
        _id: req.params.id
      }
    })
    .then(generaCommitsGitlab(res))
    .catch(handleError(res));
}

function getToken(params, usuario) {
  return new Promise((resolver, rechazar) => {
    switch (params.state) {
      case "github":
        let data = qs.stringify({
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code: code
        });
        break;
      case "gitlab":
        break;
      case "bitbucket":
        break;
      default:
        break;
    }
  });
}
export function refreshToken(req, res) {
  getToken(req.params.params, req.params.usuario)
    .then(result => {
      res.send("exito!!");
    })
    .catch(err => {
      res.send(err);
    });
}