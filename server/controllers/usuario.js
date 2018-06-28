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
import _ from "lodash";
import { Sequelize } from "sequelize";
var fetch = require("node-fetch");

function getJson() {
  return function(resultado) {
    return resultado.json();
  };
}

function generaCommitsGitlab(res) {
  return function(entity) {
    let nombreRepo = [];
    let barChartData = [];
    let commitsArray = [];
    let años = [];
    let datosArray = [];
    for (const repositorio of entity.datos) {
      nombreRepo.push(repositorio.repo.name);
      let añoCommit = [];

      let año = 0;
      let commitTotal = 1;
      let sw = true;

      for (const commits of repositorio.commits) {
        let fecha = new Date(commits.committed_date);
        if (año != fecha.getFullYear() && sw) {
          año = fecha.getFullYear();
          sw = false;
        } else {
          if (año == fecha.getFullYear()) {
            commitTotal++;
          } else {
            añoCommit.push({
              año: año,
              commit: commitTotal,
              nombre: repositorio.repo.name
            });
            datosArray.push(añoCommit);
            año = fecha.getFullYear();
            commitTotal = 1;
          }
        }
        años.push(fecha.getFullYear());
      }
      if (commitTotal != 0) {
        añoCommit.push({
          año: año,
          commit: commitTotal,
          nombre: repositorio.repo.name
        });
        datosArray.push(añoCommit);
      }
    }
    años = _.uniq(años);
    //ordena ascendentemente
    años = _.orderBy(años, o => {
      return o * -1;
    });
    datosArray = _.uniqWith(datosArray, _.isEqual);
    for (const datos of datosArray) {
      let dataCommit = [];
      let i = 0;
      for (let index = 0; index < años.length; index++) {
        if (años[index] != datos[i].año) {
          dataCommit.push(0);
        } else {
          dataCommit.push(datos[i].commit);
          if (i < datos.length - 1) {
            i++;
          }
        }
      }
      barChartData.push({
        data: dataCommit,
        label: datos[0].nombre
      });
    }
    años.reverse();
    return res.status(200).json({ barChartData, años });
  };
}

function generaCommits(res) {
  return function(entity) {
    let nombreRepo = [];
    let barChartData = [];
    let commitsArray = [];
    let años = [];
    let datosArray = [];
    for (const repositorio of entity.datos) {
      nombreRepo.push(repositorio.repo.name);
      let añoCommit = [];

      let año = 0;
      let commitTotal = 1;
      let sw = true;

      for (const commits of repositorio.commits) {
        let fecha = new Date(commits.commit.author.date);
        if (año != fecha.getFullYear() && sw) {
          año = fecha.getFullYear();
          sw = false;
          // console.log("entro", año);
        } else {
          if (año == fecha.getFullYear()) {
            commitTotal++;
          } else {
            añoCommit.push({
              año: año,
              commit: commitTotal,
              nombre: repositorio.repo.name
            });
            datosArray.push(añoCommit);
            año = fecha.getFullYear();
            commitTotal = 1;
          }
        }
        años.push(fecha.getFullYear());
      }
      if (commitTotal != 0) {
        añoCommit.push({
          año: año,
          commit: commitTotal,
          nombre: repositorio.repo.name
        });
        datosArray.push(añoCommit);
      }
    }
    años = _.uniq(años);
    //ordena ascendentemente
    años = _.orderBy(años, o => {
      return o * -1;
    });
    datosArray = _.uniqWith(datosArray, _.isEqual);
    for (const datos of datosArray) {
      let dataCommit = [];
      let i = 0;
      for (let index = 0; index < años.length; index++) {
        if (años[index] != datos[i].año) {
          dataCommit.push(0);
        } else {
          dataCommit.push(datos[i].commit);
          if (i < datos.length - 1) {
            i++;
          }
        }
      }
      barChartData.push({
        data: dataCommit,
        label: datos[0].nombre
      });
    }
    años.reverse();
    return res.status(200).json({ barChartData, años });
  };
}
function generaDatos(res) {
  return function(entity) {
    // console.log("dd:", entity);
    let nombreRepo = [];
    let barChartData = [];
    let commitsArray = [];
    let años = [];
    let datosArray = [];
    for (const repositorio of entity.datos) {
      nombreRepo.push(repositorio.repo.name);
      let añoCommit = [];

      let año = 0;
      let commitTotal = 0;
      let sw = true;

      for (const commits of repositorio.commits) {
        let fecha = new Date(commits.commit.author.date);
        if (año != fecha.getFullYear() && sw) {
          año = fecha.getFullYear();
          sw = false;
          // console.log("entro", año);
        }
        if (año == fecha.getFullYear()) {
          commitTotal++;
        } else {
          añoCommit.push({
            año: año,
            commit: commitTotal,
            nombre: repositorio.repo.name
          });
          datosArray.push(añoCommit);
          año = fecha.getFullYear();
          commitTotal = 0;
        }
        años.push(fecha.getFullYear());
      }
      if (commitTotal != 0) {
        añoCommit.push({
          año: año,
          commit: commitTotal,
          nombre: repositorio.repo.name
        });
        datosArray.push(añoCommit);
      }
    }
    años = _.uniq(años);
    //ordena ascendentemente
    años = _.orderBy(años, o => {
      return o * -1;
    });
    datosArray = _.uniqWith(datosArray, _.isEqual);
    for (const datos of datosArray) {
      let dataCommit = [];
      let i = 0;
      for (let index = 0; index < años.length; index++) {
        if (años[index] != datos[i].año) {
          dataCommit.push(0);
        } else {
          dataCommit.push(datos[i].commit);
          if (i < datos.length - 1) {
            i++;
          }
        }
      }
      barChartData.push({
        data: dataCommit,
        label: datos[0].nombre
      });
    }
    return res.status(200).json(barChartData);
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

// Gets a list of Usuarios y busca usuario
export function index(req, res) {
  if (req.query.buscar != undefined) {
    const Op = Sequelize.Op;
    return Usuario.findAndCountAll({
      include: [{ all: true }],
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
    return Usuario.findAndCountAll({
      include: [{ all: true }],
      where: {
        estado: true
      },
      // order: [["clasificacion", "desc"]],
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
  obj.cuentas = ["local"];
  obj.tipo = params.tipo;
  obj.role = params.role;

  if (params.password) {
    bcrypt.hash(params.password, null, null, (err, hash) => {
      obj.password = hash;
      if (obj.nombre != null && obj.email != null && obj.password != null) {
        return Usuario.create(obj)
          .then(respondWithResult(res, 201))
          .catch(handleError(res));
      } else {
        res.status(400).send({ mensaje: "rellena todos los datos" });
      }
    });
  } else {
    res.status(500).send({ mensaje: "introduce la contraseña" });
  }
  // return Usuario.create(obj)
  // .then(respondWithResult(res, 201))
  // .catch(handleError(res));
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
            res.status(404).send({ mensaje: "Contraseña incorrecta" });
          }
        });
      } else {
        res
          .status(404)
          .send({ mensaje: "No existe el usuario o contraseña incorrecta " });
      }

      // respondWithResult(res, 201)
    });
  // .catch(res.status(404).send({ mensaje: "No existe el usuario o contraseña incorrecta " }));
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
