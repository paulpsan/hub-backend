/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/commits              ->  index
 * POST    /api/commits              ->  create
 * GET     /api/commits/:id          ->  show
 * PUT     /api/commits/:id          ->  upsert
 * PATCH   /api/commits/:id          ->  patch
 * DELETE  /api/commits/:id          ->  destroy
 */

"use strict";

import jsonpatch from "fast-json-patch";
import { Commit } from "../sqldb";
import https from "https";
import TokenController from "./token";
import { Sequelize } from "sequelize";
import _ from "lodash";

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

function saveUpdates() {
  return function(entity) {
    return entity
      .updateAttributes({ estado: false })
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
    res.status(statusCode).send(err);
  };
}
function crearCommit(objCommit) {
  return Commit.findOne({
    where: {
      sha: objCommit.sha,
      fk_repositorio: objCommit.fk_repositorio
    }
  }).then(respCommit => {
    if (respCommit === null) {
      return Commit.create(objCommit);
    } else {
      return Commit.update(objCommit);
    }
  });
}
async function addCommitsGithub(commits, repo) {
  for (const commit of commits) {
    let objCommit = {
      sha: commit.sha,
      autor: commit.commit.author.name,
      mensaje: commit.commit.message,
      fecha: commit.commit.author.date,
      id_usuario: repo.fk_usuario,
      estado: true,
      avatar_autor: commits.committer.avatar_url,
      web_url_autor: commits.committer.url,
      fk_repositorio: repo._id
    };
    await crearCommit(objCommit);
  }
  return true;
}
async function addCommitsGitlab(commits, repo) {
  for (const commit of commits) {
    console.log("res", commit);
    let objCommit = {
      sha: commit.id,
      autor: commit.author_name,
      mensaje: commit.message,
      fecha: commit.committed_date,
      estado: true,
      id_usuario: repo.fk_usuario,
      fk_repositorio: repo._id
    };
    await crearCommit(objCommit);
  }
  return true;
}
async function addCommitsBitbucket(commits, repo) {
  for (const commit of commits) {
    let objCommit = {
      sha: commit.hash,
      autor: commit.author.user.username,
      mensaje: commit.message,
      fecha: commit.date,
      estado: true,
      avatar_autor: commit.author.user.links.avatar.href,
      web_url_autor: commit.author.user.links.html.href,
      id_usuario: repo.fk_usuario,
      fk_repositorio: repo._id
    };
    await crearCommit(objCommit);
  }
  return true;
}

export function index(req, res) {
  return Commit.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Commit from the DB
export function show(req, res) {
  return Commit.findAll({ where: { fk_repositorio: req.params.id } })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
// Creates a new Commit in the DB
export function create(req, res) {
  let repo = req.body;
  let url = req.body.commits;
  let tipo = req.body.tipo;
  let tokenGitlab;
  TokenController.getToken("gitlab", repo.fk_usuario).then(result => {
    tokenGitlab = result;
    console.log("token", tokenGitlab);
    switch (tipo) {
      case "github":
        fetch(url, {
          agent,
          strictSSL: false
        })
          .then(getJson())
          .then(commits => {
            //validar
            console.log("object", commits);
            if (addCommitsGithub(commits, repo)) {
              res.json({ respuesta: "Se actualizaron correctamente!" });
            } else {
              res
                .status(500)
                .json({ error: "Problema en actualizacion" })
                .end();
            }
          });

        break;
      case "gitlab":
        if (tokenGitlab) {
          fetch(url + "?access_token=" + tokenGitlab, {
            agent,
            strictSSL: false
          })
            .then(getJson())
            .then(commits => {
              if (addCommitsGitlab(commits, repo)) {
                res.json({ respuesta: "Se actualizaron correctamente!" });
              } else {
                res
                  .status(500)
                  .json({ error: "Problema en actualizacion" })
                  .end();
              }
            });
        } else {
          console.log("-----------errr token--------------");
        }
        //necesita token
        break;
      case "bitbucket":
        fetch(url, {
          agent,
          strictSSL: false
        })
          .then(getJson())
          .then(commits => {
            if (addCommitsBitbucket(commits.values, repo)) {
              res.json({ respuesta: "Se actualizaron correctamente!" });
            } else {
              res
                .status(500)
                .json({ error: "Problema en actualizacion" })
                .end();
            }
          });

        break;
      default:
        res
          .status(500)
          .json({ error: "Problema en actualizacion" })
          .end();
        break;
    }
  });
  // console.log("comm", commits);
}

// Upserts the given Commit in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Commit.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
function updateCommit(object) {
  return Commit.find({
    where: {
      _id: object._id
    }
  })
    .then(saveUpdates(object))
    .catch(err => {
      console.log(err);
    });
}

async function updateCommits(commits) {
  for (const commit of commits) {
    let objCommit = {
      _id: commit._id,
      sha: commit.sha,
      autor: commit.autor,
      mensaje: commit.mensaje,
      fecha: commit.fecha,
      id_usuario: commit.id_usuario,
      estado: false,
      //avatar_autor: commits.committer.avatar_url,
      //web_url_autor: commits.committer.url,
      fk_repositorio: commit.fk_repositorio
    };
    await updateCommit(objCommit);
  }
  return true;
}
// Updates an existing Commit in the DB
export function patch(req, res) {
  console.log("-------------------ss");
  return Commit.findAll({
    where: {
      fk_repositorio: req.params.id
    }
  })
    .then(commits => {
      console.log("asd", commits.length);
      if (updateCommits(commits)) {
        res.json({ respuesta: "Se actualizaron correctamente!" });
      } else {
        res
          .status(500)
          .json({ error: "Problema en actualizacion" })
          .end();
      }
    })
    .catch(handleError(res));
}

// Deletes a Commit from the DB
export function destroy(req, res) {
  return Commit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
export function totalCommit(req, res) {
  return Commit.findOne({
    attributes: [[Sequelize.fn("COUNT", Sequelize.col("id_usuario")), "total"]],
    where: {
      id_usuario: req.params.id,
      estado: true
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(err => {
      console.log(err);
    });
}
export function graficaCommits(req, res) {
  return Commit.findAll({
    where: {
      estado: true
    }
  })
    .then(response => {
      let barChartData = [];
      let años = [];
      let datosArray = [];
      let commits = response;
      let fecha;
      for (const commit of commits) {
        if (commit.estado) {
          fecha = new Date(commit.fecha);
          console.log(fecha.getFullYear());
          if (años.indexOf(fecha.getFullYear()) < 0) {
            años.push(fecha.getFullYear());
          }
        }
      }
      años = _.sortBy(años);
      for (const año of años) {
        let contador = 0;
        for (const commit of commits) {
          fecha = new Date(commit.fecha);
          if (año === fecha.getFullYear()) {
            contador += 1;
          }
        }
        datosArray.push(contador);
      }
      barChartData.push({
        data: datosArray,
        label: "Commits"
      });
      return res.status(200).json({ barChartData, años });
    })
    .catch(err => {
      console.log(err);
    });
}
