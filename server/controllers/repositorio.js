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
import Gitlab from "../components/repository-proxy/repositories/gitlab";
import SequelizeHelper from "../components/sequelize-helper";
import config from "../config/environment";
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
    // console.log("--------", entity, updates);
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

function creaAdiciona(usuario) {
  return async function(repositorios) {
    for (const repo of repositorios) {
      let objRepositorio = {
        id_repositorio: repo.id,
        nombre: repo.name,
        descripcion: repo.description || "",
        avatar: "",
        tipo: "github",
        visibilidad: false,
        estado: true,
        html_url: repo.html_url,
        git_url: repo.git_url,
        api_url: repo.url,
        fork: repo.forks_url,
        hooks: repo.hooks_url,
        tags: repo.tags_url,
        issues: repo.url + "/issues",
        branches: repo.url + "/branches",
        lenguajes: repo.languages_url,
        star: repo.stargazers_count,
        commits: repo.url + "/commits",
        downloads: repo.stargazers_count,
        fk_usuario: usuario._id
      };
      await Repositorio.findOne({
        where: {
          id_repositorio: objRepositorio.id_repositorio,
          fk_usuario: usuario._id
        }
      })
        .then(repo => {
          if (repo !== null) {
            return Repositorio.update(objRepositorio, {
              where: {
                _id: repo._id
              }
            });
          } else {
            // console.log("objRepositorio", objRepositorio);
            return Repositorio.create(objRepositorio);
          }
        })
        .catch();
    }
    return;
  };
}

function adicionaGithub(token, usuario) {
  return new Promise((resolver, rechazar) => {
    fetch("https://api.github.com/user?access_token=" + token)
      .then(getJson())
      .then(responseGithub => {
        fetch(
          "https://api.github.com/users/" +
            responseGithub.login +
            "/repos" +
            "?access_token=" +
            token
        )
          .then(getJson())
          .then(creaAdiciona(usuario))
          .then(resp => {
            resolver("se agrego correctamente los repositorios");
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        rechazar(err);
      });
  });
}

function creaGitlab(usuario) {
  return async function(repositorios) {
    console.log("repos", repositorios);
    for (const repo of repositorios) {
      let objRepositorio = {
        id_repositorio: repo.id,
        nombre: repo.name,
        descripcion: repo.description || " ",
        avatar: repo.avatar_url,
        tipo: "gitlab",
        visibilidad: false,
        estado: true,
        html_url: repo.web_url,
        git_url: repo.ssh_url_to_repo,
        api_url: config.gitlabGeo.api_url + "projects/",
        fork: config.gitlabGeo.api_url + "projects/" + repo.id + "/forks",
        hooks: config.gitlabGeo.api_url + "projects/" + repo.id + "/hooks",
        tags: repo.tag_list || " ",
        issues: config.gitlabGeo.api_url + "projects/" + repo.id + "/issues",
        branches:
          config.gitlabGeo.api_url +
          "projects/" +
          repo.id +
          "/repository/branches",
        lenguajes:
          config.gitlabGeo.api_url + "projects/" + repo.id + "/languages" || "",
        star: repo.star_count,
        commits:
          config.gitlabGeo.api_url +
          "projects/" +
          repo.id +
          "/repository/commits",
        downloads: "",
        fk_usuario: usuario._id
      };

      await Repositorio.findOne({
        where: {
          id_repositorio: objRepositorio.id_repositorio,
          fk_usuario: usuario._id
        }
      })
        .then(repo => {
          if (repo !== null) {
            return Repositorio.update(objRepositorio, {
              where: {
                _id: repo._id
              }
            });
          } else {
            // console.log("objRepositorio", objRepositorio);
            return Repositorio.create(objRepositorio);
          }
        })
        .catch();
    }
    return;
  };
}

function adicionaGitlab(token, usuario) {
  return new Promise((resolver, rechazar) => {
    fetch("https://gitlab.geo.gob.bo/api/v4/user?access_token=" + token, {
      agent,
      strictSSL: false
    })
      .then(getJson())
      .then(responseGitlab => {
        fetch(
          "https://gitlab.geo.gob.bo/api/v4/users/" +
            responseGitlab.id +
            "/projects" +
            "?access_token=" +
            token,
          { agent, strictSSL: false }
        )
          .then(getJson())
          .then(creaGitlab(usuario))
          .then(resp => {
            resolver("se agrego correctamente los repositorios");
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        rechazar(err);
      });
  });
}
function creaBitbucket(usuario) {
  return async function(repositorios) {
    let i = 0;
    for (const repo of repositorios.values) {
      console.log("repos", repo);
      let objRepositorio = {
        id_repositorio: i,
        nombre: repo.name,
        descripcion: repo.description,
        avatar: repo.links.avatar.href,
        tipo: "bitbucket",
        visibilidad: false,
        estado: true,
        html_url: repo.links.html.href,
        git_url: repo.links.clone[1].href,
        api_url: repo.links.self.href,
        fork: repo.links.forks.href,
        hooks: repo.links.hooks.href,
        tags: repo.links.tags.href,
        issues:
          config.bitbucket.api_url +
          "repositories/" +
          repo.full_name +
          "/issues",
        branches: repo.links.branches.href,
        lenguajes: repo.language,
        star: "",
        commits: repo.links.commits.href,
        downloads: repo.links.downloads.href,
        fk_usuario: usuario._id
      };

      await Repositorio.findOne({
        where: {
          id_repositorio: objRepositorio.id_repositorio,
          fk_usuario: usuario._id
        }
      })
        .then(repo => {
          if (repo !== null) {
            return Repositorio.update(objRepositorio, {
              where: {
                _id: repo._id
              }
            });
          } else {
            // console.log("objRepositorio", objRepositorio);
            return Repositorio.create(objRepositorio);
          }
        })
        .catch();
      i++;
    }
    return;
  };
}

function adicionaBitbucket(token, usuario) {
  return new Promise((resolver, rechazar) => {
    fetch("https://api.bitbucket.org/2.0/user?access_token=" + token)
      .then(getJson())
      .then(responseGitlab => {
        fetch(responseGitlab.links.repositories.href + "?access_token=" + token)
          .then(getJson())
          .then(creaBitbucket(usuario))
          .then(resp => {
            resolver("se agrego correctamente los repositorios");
          })
          .catch(err => {
            rechazar(err);
          });
      })
      .catch(err => {
        rechazar(err);
      });
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
      _id: req.params.id,
      estado: true
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
  // let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  let tipo = req.body.tipo;
  switch (tipo) {
    case "github":
      adicionaGithub(token, usuario)
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
    case "gitlab":
      adicionaGitlab(token, usuario)
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
      adicionaBitbucket(token, usuario)
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

async function desvincularRepos(repos) {
  for (const repo of repos) {
    let objrepo = {
      _id:repo._id,
      estado: false,
      fk_repositorio: repo.fk_repositorio
    };
    await updateRepo(objrepo);
  }
  return true;
}

//Desvincula
export function desvincular(req, res) {
  let usuario = req.body;
  return Repositorio.findAll({
    where: {
      _id: usuario._id
    }
  })
    .then(resp => {
      if (desvincularRepos(resp)) {
        res.json({ respuesta: "Se actualizaron correctamente!" });
      } else {
        res
          .status(500)
          .json({ error: "Problema en actualizacion" })
          .end();
      }
    })
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
