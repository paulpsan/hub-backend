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
function crearCommit(objCommit) {
  return Commit.findOne({
    where: {
      sha: objCommit.sha,
      fk_repositorio: objCommit.fk_repositorio
    }
  }).then(respCommit => {
    if (respCommit === null) {
      return Commit.create(objCommit);
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
  return Commit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
async function getToken(tipo, id) {
  let token;
  await TokenController.getToken(tipo, id).then(resp => {
    token = resp;
  });
  return token;
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

// Updates an existing Commit in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Commit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
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
