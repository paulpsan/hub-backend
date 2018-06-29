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

async function getToken(repo) {
  let token = await TokenController.getToken(repo.tipo, repo.fk_usuario);
  return token;
}

function setCommits(repo, token) {
  return function(entity) {
    return fetch(entity.commits.url + "?access_token=" + token, {
      agent,
      strictSSL: false
    })
      .then(getJson())
      .then(respuesta => {
        console.log("commits", respuesta);
        repo.commits.total = respuesta.length;
        return entity;
      })
      .catch(err => {
        console.log(err);
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
        console.log("issues", respuesta);

        repo.issues.total = respuesta.length;
        return entity;
      })
      .catch(err => {
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
          if (!respuesta.error) {
            repo.forks.total = respuesta.length;
          }
          return entity;
        })
        .catch(err => {
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

          repo.downloads.total = respuesta.length;
          return entity;
        })
        .catch(err => {
          return err;
        });
    }
    return entity;
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
        forks: {
          url: repo.forks_url,
          total: 0
        },
        hooks: repo.hooks_url,
        tags: repo.tags_url,
        issues: {
          url: repo.url + "/issues",
          total: 0
        },
        branches: repo.url + "/branches",
        lenguajes: repo.languages_url,
        stars: {
          url: "",
          total: repo.stargazers_count
        },
        commits: {
          url: repo.url + "/commits",
          total: 0
        },
        downloads: {
          url: repo.url + "/downloads",
          total: 0
        },
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
        forks: {
          url: config.gitlabGeo.api_url + "projects/" + repo.id + "/forks",
          total: 0
        },
        hooks: config.gitlabGeo.api_url + "projects/" + repo.id + "/hooks",
        tags: repo.tag_list || " ",
        issues: {
          url: config.gitlabGeo.api_url + "projects/" + repo.id + "/issues",
          total: 0
        },

        branches:
          config.gitlabGeo.api_url +
          "projects/" +
          repo.id +
          "/repository/branches",
        lenguajes:
          config.gitlabGeo.api_url + "projects/" + repo.id + "/languages" || "",
        stars: {
          url: "",
          total: repo.star_count
        },
        commits: {
          url:
            config.gitlabGeo.api_url +
            "projects/" +
            repo.id +
            "/repository/commits",
          total: 0
        },

        downloads: {
          url: "",
          total: 0
        },
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
        forks: {
          url: repo.links.forks.href,
          total: 0
        },
        hooks: repo.links.hooks.href,
        tags: repo.links.tags.href,
        issues: {
          url:
            config.bitbucket.api_url +
            "repositories/" +
            repo.full_name +
            "/issues",
          total: 0
        },

        branches: repo.links.branches.href,
        lenguajes: repo.language,
        stars: {
          url: "",
          total: 0
        },
        commits: {
          url: repo.links.commits.href,
          total: 0
        },
        downloads: {
          url: repo.links.downloads.href,
          total: 0
        },
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

export function proyectos(req, res) {
  //esto se debe cambiar al proxy de repositorios
  let gitlab = new Gitlab("https://gitlab.geo.gob.bo", "7-VmBEpTd33s28N5dHvy");
  gitlab.proyectos().then(resultado => {
    res.send(resultado);
  });
}

// Creates a new Repositorio in the DB
export function create(req, res) {
  return Repositorio.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addOauth(req, res) {
  let usuario = req.body.usuario;
  // let usuarioOauth = req.body.usuarioOauth;
  let token = req.body.token;
  let tipo = req.body.tipo;
  TokenController.createToken(tipo, usuario, token);
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

async function desvincularRepos(repos, tipo) {
  for (const repo of repos) {
    console.log("----------", repo.nombre, tipo);
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

//Desvincula
export function desvincular(req, res) {
  let usuario = req.body;
  return Repositorio.findAll({
    where: {
      fk_usuario: usuario._id
    }
  })
    .then(resp => {
      if (desvincularRepos(resp, req.params.tipo)) {
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
  let token = await getToken(repo);
  console.log("****token******", repo, token);
  return Repositorio.find({
    where: {
      _id: repo._id
    }
  })
    .then(handleEntityNotFound(res))
    .then(setCommits(repo, token))
    .then(setIssues(repo, token))
    .then(setForks(repo, token))
    .then(setStars(repo, token))
    .then(setDownloads(repo, token))
    .then(saveUpdates(repo, token))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
