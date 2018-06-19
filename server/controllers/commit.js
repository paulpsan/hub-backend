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

async function addCommitsGithub(commits, repo) {
  console.log("res", commits.length);
  for (const commit of commits) {
    let objCommit = {
      sha: commit.sha,
      autor: commit.commit.author.name,
      mensaje: commit.commit.message,
      fecha: commit.commit.author.date,
      fk_repositorio: repo._id
    };
    await Commit.create(objCommit)
      .then(resp => {
        console.log("res", resp);
      })
      .catch(err => {
        console.log(err);
      });
  }
  console.log("---finalize");
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

// Creates a new Commit in the DB
export function create(req, res) {
  let repo = req.body;
  let url = req.body.commits;
  let tipo = req.body.tipo;
  // console.log("url", req.body.commits);
  fetch(url, {
    agent,
    strictSSL: false
  })
    .then(getJson())
    .then(commits => {
      switch (tipo) {
        case "github":
          addCommitsGithub(commits, repo);

          break;

        default:
          break;
      }
      // console.log("comm", commits);
    })
    .catch(err => {
      console.log(err);
    });
  return Commit.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
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
