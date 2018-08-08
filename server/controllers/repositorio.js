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

import { Repositorio } from "../sqldb";
import TokenController from "./token";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
import * as github from "./github";
import * as gitlab from "./gitlab";
import * as bitbucket from "./bitbucket";
import https from "https";
var fetch = require("node-fetch");

const agent = new https.Agent({
  rejectUnauthorized: false
});

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
function saveUpdates(updates) {
  return function(entity) {
    return entity
      .updateAttributes(updates)
      .then(updated => {
        return updated;
      })
      .catch(err => {
        return err;
      });
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
    console.log(err);
    res.status(statusCode).send(err);
  };
}
async function getToken(tipo, id) {
  let token = await TokenController.getToken(tipo, id);
  return token;
}

function setLenguajes(repo, token) {
  return function(entity) {
    if (entity.lenguajes.url !== "") {
      return fetch(entity.lenguajes.url + "?access_token=" + token, {
        agent,
        strictSSL: false
      })
        .then(getJson())
        .then(respuesta => {
          console.log("lenguajes", respuesta);
          if (Array.isArray(respuesta)) {
            repo.lenguajes.datos = respuesta;
          } else {
            repo.lenguajes.datos = !respuesta.error ? respuesta : "";
          }
          return entity;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
    return entity;
  };
}

function setCommits(repo, token) {
  return function(entity) {
    return fetch(entity.commits.url + "?access_token=" + token, {
      agent,
      strictSSL: false
    })
      .then(getJson())
      .then(respuesta => {
        // console.log("commits", respuesta);
        if (Array.isArray(respuesta)) {
          repo.commits.total = respuesta.length;
        } else {
          repo.commits.total = !respuesta.error ? respuesta.values.length : 0;
        }
        return entity;
      })
      .catch(err => {
        console.log("errr*****", err);
        return err;
      });
  };
}

function setIssues(repo, token) {
  return function(entity) {
    return fetch(entity.issues.url + "?access_token=" + token, {
      agent,
      strictSSL: false
    })
      .then(getJson())
      .then(respuesta => {
        if (Array.isArray(respuesta)) {
          repo.issues.total = respuesta.length;
        } else {
          repo.issues.total = !respuesta.error ? respuesta.values.length : 0;
        }
        console.log("issues", respuesta);
        return entity;
      })
      .catch(err => {
        console.log(err);

        return err;
      });
  };
}

function setForks(repo, token) {
  return function(entity) {
    if (entity.forks.url !== "") {
      return fetch(entity.forks.url + "?access_token=" + token, {
        agent,
        strictSSL: false
      })
        .then(getJson())
        .then(respuesta => {
          console.log("forks", respuesta);
          if (Array.isArray(respuesta)) {
            repo.forks.total = respuesta.length;
          } else {
            repo.forks.total = !respuesta.error ? respuesta.values.length : 0;
          }
          return entity;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
    return entity;
  };
}

function setStars(repo, token) {
  return function(entity) {
    if (entity.stars.url !== "") {
      return fetch(entity.stars.url + "?access_token=" + token, {
        agent,
        strictSSL: false
      })
        .then(getJson())
        .then(respuesta => {
          console.log("stars", respuesta);

          repo.stars.total = respuesta.length;
          return entity;
        })
        .catch(err => {
          console.log(err);

          return err;
        });
    }
    return entity;
  };
}

function setDownloads(repo, token) {
  return function(entity) {
    if (entity.downloads.url !== "") {
      return fetch(entity.downloads.url + "?access_token=" + token, {
        agent,
        strictSSL: false
      })
        .then(getJson())
        .then(respuesta => {
          console.log("downloads", respuesta);
          if (Array.isArray(respuesta)) {
            repo.downloads.total = respuesta.length;
          } else {
            repo.downloads.total = !respuesta.error
              ? respuesta.values.length
              : 0;
          }
          return entity;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
    return entity;
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
  // console.log(req.params.id);
  return Repositorio.findAndCountAll({
    include: [{ all: true }],
    where: {
      fk_usuario: req.params.id,
      estado: true
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
    include: [{ all: true }],
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Repositorio in the DB
export function create(req, res) {
  return Repositorio.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}
async function getToken(tipo, id) {
  let token = await TokenController.getToken(tipo, id);
  return token;
}
//POST url="repositorios/oauth"
export async function addOauth(req, res) {
  let usuario = req.body.usuario;
  // let usuarioOauth = req.body.usuarioOauth;
  let tipo = req.body.tipo;
  let token;
  token = await getToken(tipo, usuario._id);
  switch (tipo) {
    case "github":
      github
        .adicionaGithub(token, usuario, tipo)
        .then(resp => {
          res.json({ respuesta: resp });
        })
        .catch(err => {
          console.log(err);
          res
            .status(500)
            .json(err)
            .end();
        });
      break;
    case "bitbucket":
      bitbucket
        .adicionaBitbucket(token, usuario)
        .then(resp => {
          res.json({ respuesta: resp });
        })
        .catch(err => {
          console.log(err);
          res
            .status(500)
            .json(err)
            .end();
        });
      break;

    default:
      gitlab
        .adicionaGitlab(token, usuario, tipo)
        .then(resp => {
          res.json({ respuesta: resp });
        })
        .catch(err => {
          console.log(err);
          res
            .status(500)
            .json({ mensaje: err.message })
            .end();
        });
      break;
  }
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
  return Repositorio.find({
    where: {
      _id: req.body._id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function updateRepo(object) {
  return Repositorio.find({
    where: {
      _id: object._id
    }
  })
    .then(saveUpdates(object))
    .catch(err => {
      console.log(err);
    });
}

async function desvincularRepos(repos, tipo) {
  for (const repo of repos) {
    if (repo.tipo == tipo) {
      let objrepo = {
        _id: repo._id,
        id_repositorio: repo.id_repositorio,
        estado: false,
        fk_repositorio: repo.fk_repositorio
      };
      await updateRepo(objrepo);
    }
  }
  return true;
}

//Desvincula repositorios
export function desvincular(req, res) {
  let tipo = req.params.tipo;
  let usuario = req.body;
  return Repositorio.findAll({
    where: {
      fk_usuario: usuario._id
    }
  })
    .then(resp => {
      if (desvincularRepos(resp, tipo)) {
        res.json({ respuesta: "Se actualizaron correctamente!" });
      } else {
        res
          .status(500)
          .json({ error: "Problema en actualizacion" })
          .end();
      }
      return null;
    })
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
  fetch(req.body.url)
    .then(getJson())
    .then(respuesta => {
      res.send(respuesta);
    })
    .catch();
}

export async function setDatos(req, res) {
  let repo = req.body;
  let token = await getToken(repo.tipo, repo.fk_usuario);
  return Repositorio.find({
    where: {
      _id: repo._id
    }
  })
    .then(handleEntityNotFound(res))
    .then(setLenguajes(repo, token))
    .then(setCommits(repo, token))
    .then(setIssues(repo, token))
    .then(setForks(repo, token))
    .then(setStars(repo, token))
    .then(setDownloads(repo, token))
    .then(saveUpdates(repo, token))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
