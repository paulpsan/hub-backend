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

function saveUpdates(updates) {
  return function(entity) {
    console.log("--------", entity, updates);
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

function adicionaDatosGithub(token, usuario, usuarioOauth) {
  return new Promise((resolver, rechazar) => {
    fetch(
      "https://api.github.com/users/" +
        usuarioOauth.login +
        "/repos" +
        "?access_token=" +
        token
    )
      .then(getJson())
      .then(repositorios => {
        // console.log("reps", repositorios);
        let i = 1;
        let objDatos = [];
        if (repositorios.length > 0) {
          let objCommits = {};
          asyncLoop({
            length: repositorios.length,
            functionToLoop: function(loop, i) {
              fetch(
                "https://api.github.com/repos/" +
                  repositorios[i].full_name +
                  "/commits?access_token=" +
                  token
              )
                .then(getJson())
                .then(commits => {
                  let objRepositorio = {
                    id_repositorio: repositorios[i].id,
                    nombre: repositorios[i].name,
                    descripcion: repositorios[i].description || "",
                    avatar: "",
                    tipo: "github",
                    estado: false,
                    html_url: repositorios[i].html_url,
                    git_url: repositorios[i].git_url,
                    api_url: repositorios[i].url,
                    fork: repositorios[i].forks_url,
                    hooks: repositorios[i].hooks_url,
                    tags: repositorios[i].tags_url,
                    issues: repositorios[i].url + "/issues",
                    branches: repositorios[i].url + "/branches",
                    lenguajes: repositorios[i].languages_url,
                    star: repositorios[i].stargazers_count,
                    commits: commits,
                    downloads: repositorios[i].stargazers_count,
                    fk_usuario: usuario._id
                  };

                  Repositorio.findOne({
                    where: {
                      id_repositorio: objRepositorio.id_repositorio,
                      fk_usuario: usuario._id
                    }
                  })
                    .then(user => {
                      if (user !== null) {
                        Repositorio.update(objRepositorio, {
                          where: {
                            _id: user._id
                          }
                        })
                          .then(resultRepo => {})
                          .catch();
                      } else {
                        // console.log("objRepositorio", objRepositorio);
                        return Repositorio.create(objRepositorio)
                          .then(resultRepo => {
                            return;

                          })
                          .catch();
                      }
                    })
                    .catch();
                  loop();
                })
                .catch(err => {
                  console.log(err);
                });
            },
            callback: function() {
              usuario.github = true;
              usuario.id_github = usuarioOauth.id;
              Usuario.update(usuario, {
                where: {
                  _id: usuario._id
                }
              }).then(result => {
                console.log("++++++++++++++++++", result, "++++++++++++++++");
                if (result.length > 0) {
                  resolver({
                    token: token,
                    usuario: usuario
                  });
                  // res
                  //   .status(200)
                  //   .json({ result: "Se realizaron actualizaciones" });
                } else {
                  rechazar({ err: "No tiene actualizaciones" });
                  // res.status(200).json({ result: "No tiene actualizaciones" });
                }
              });
            }
          });
        }
      })
      .catch();
  });
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
  console.log(req.body);
  return Repositorio.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addOauth(req, res) {
  let usuario = req.body.usuario;
  let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  let tipo = req.body.tipo;
  switch (tipo) {
    case "github":
    adicionaDatosGithub(token, usuario,usuarioOauth)
    .then(resp => {
      Usuario.findById(resp.usuario._id)
        .then(user => {
          //armar usuario respuesta
          res.json({ token: resp.token, usuario: user });
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.send(err);
    });
      break;
    case "gitlab":
      break;
    case "bitbucket":
      break;

    default:
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
  // console.log("object", req.body);

  fetch(req.body.url)
    .then(getJson())
    .then(respuesta => {
      // console.log(respuesta);
      res.send(respuesta);
    })
    .catch();
}
